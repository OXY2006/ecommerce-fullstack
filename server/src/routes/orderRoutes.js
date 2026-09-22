import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/orders
 * Place an order from the user's current shopping cart.
 * Executes a PostgreSQL database transaction to:
 *  1. Validate shipping address fields
 *  2. Retrieve user's cart items
 *  3. Verify product stock availability
 *  4. Calculate order totals server-side
 *  5. Insert Order record
 *  6. Insert OrderItem records (snapshotting product price & name)
 *  7. Decrease product stock
 *  8. Clear cart items
 *  9. Commit transaction
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const {
    shippingName,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode
  } = req.body;

  // 1. Validate shipping address fields on backend
  if (
    !shippingName || !shippingName.trim() ||
    !shippingAddress || !shippingAddress.trim() ||
    !shippingCity || !shippingCity.trim() ||
    !shippingState || !shippingState.trim() ||
    !shippingPostalCode || !shippingPostalCode.trim()
  ) {
    return res.status(400).json({
      message: 'All shipping fields (shippingName, shippingAddress, shippingCity, shippingState, shippingPostalCode) are required.'
    });
  }

  // Dedicated client connection from pool required for database transactions
  const client = await pool.connect();

  try {
    // BEGIN PostgreSQL transaction
    await client.query('BEGIN');

    // 2. Find authenticated user's cart
    const cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Your cart is empty. Cannot place an order.'
      });
    }

    const cartId = cartResult.rows[0].id;

    // 3. Fetch cart items joined with current product data (with FOR UPDATE lock on products)
    const cartItemsQuery = `
      SELECT 
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price::float AS price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      FOR UPDATE OF p
    `;

    const { rows: cartItems } = await client.query(cartItemsQuery, [cartId]);

    // 4. Verify cart is not empty
    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Your cart is empty. Cannot place an order.'
      });
    }

    // 5. Verify stock availability for every product in cart
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          message: `Insufficient stock for product "${item.product_name}". Requested: ${item.quantity}, Available: ${item.stock}.`
        });
      }
    }

    // 6. Calculate totals on server side (never trust frontend totals)
    let totalAmount = 0;
    const itemsToInsert = cartItems.map((item) => {
      const itemSubtotal = parseFloat((item.price * item.quantity).toFixed(2));
      totalAmount += itemSubtotal;
      return {
        productId: item.product_id,
        productName: item.product_name,
        price: item.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      };
    });

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 7. Create Order record
    const insertOrderQuery = `
      INSERT INTO orders (
        user_id,
        total_amount,
        status,
        shipping_name,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code
      ) VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7)
      RETURNING id, total_amount AS "totalAmount", status, created_at AS "createdAt";
    `;

    const orderResult = await client.query(insertOrderQuery, [
      userId,
      totalAmount,
      shippingName.trim(),
      shippingAddress.trim(),
      shippingCity.trim(),
      shippingState.trim(),
      shippingPostalCode.trim()
    ]);

    const createdOrder = orderResult.rows[0];

    // 8. Create OrderItem records and decrease product stock
    for (const item of itemsToInsert) {
      // Insert OrderItem with price and name snapshot
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, price, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          createdOrder.id,
          item.productId,
          item.productName,
          item.price,
          item.quantity,
          item.subtotal
        ]
      );

      // Decrease product stock in database
      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // 9. Clear user's cart items (Cart row remains empty for reuse)
    await client.query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cartId]
    );

    // COMMIT transaction if all queries succeed
    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: createdOrder.id,
        totalAmount: parseFloat(createdOrder.totalAmount),
        status: createdOrder.status,
        createdAt: createdOrder.createdAt
      }
    });
  } catch (error) {
    // ROLLBACK transaction on any database or runtime error
    await client.query('ROLLBACK');
    console.error('Error during checkout transaction:', error);
    return res.status(500).json({
      message: 'Server error while processing your order.'
    });
  } finally {
    // Release client back to the PostgreSQL pool
    client.release();
  }
});

export default router;
