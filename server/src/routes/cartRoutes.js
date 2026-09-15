import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Helper function to find or create a persistent cart for an authenticated user.
 * Option B: Cart is lazily initialized upon the first cart interaction.
 * Uses ON CONFLICT to avoid duplicate cart creation.
 */
async function getOrCreateCart(userId) {
  // Check if cart already exists for this user
  const existingCart = await pool.query(
    'SELECT id FROM carts WHERE user_id = $1',
    [userId]
  );

  if (existingCart.rows.length > 0) {
    return existingCart.rows[0].id;
  }

  // Create a new cart if one does not exist
  const newCart = await pool.query(
    `INSERT INTO carts (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING id`,
    [userId]
  );

  if (newCart.rows.length > 0) {
    return newCart.rows[0].id;
  }

  // Fallback re-query in case of race conditions
  const refetchedCart = await pool.query(
    'SELECT id FROM carts WHERE user_id = $1',
    [userId]
  );
  return refetchedCart.rows[0].id;
}

/**
 * GET /api/cart
 * Fetch current authenticated user's cart and product details using SQL JOIN.
 * Server-side totals are computed using product prices.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);

    // Query cart items with joined product information and calculated subtotal
    const cartQuery = `
      SELECT 
        ci.id,
        ci.product_id AS "productId",
        p.name,
        p.price::float AS price,
        p.image,
        p.stock,
        ci.quantity,
        (p.price * ci.quantity)::float AS subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC
    `;

    const { rows: items } = await pool.query(cartQuery, [cartId]);

    // Calculate total on backend (never trust frontend totals)
    const totalRaw = items.reduce((acc, item) => acc + item.subtotal, 0);
    const total = parseFloat(totalRaw.toFixed(2));

    return res.status(200).json({
      cart: {
        id: cartId,
        items,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return res.status(500).json({
      message: 'Server error while fetching shopping cart.'
    });
  }
});

/**
 * POST /api/cart/items
 * Add a product to the user's cart or update existing quantity.
 * Body: { productId, quantity }
 */
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // 1. Validate productId
    const parsedProductId = parseInt(productId, 10);
    if (isNaN(parsedProductId) || parsedProductId <= 0) {
      return res.status(400).json({
        message: 'Invalid product ID format.'
      });
    }

    // 2. Validate quantity rule (must be a positive integer)
    const parsedQuantity = parseInt(quantity, 10);
    if (
      isNaN(parsedQuantity) ||
      parsedQuantity <= 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer greater than 0.'
      });
    }

    // 3. Verify product existence and check available stock
    const productResult = await pool.query(
      'SELECT id, name, price::float AS price, stock FROM products WHERE id = $1',
      [parsedProductId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const product = productResult.rows[0];

    // 4. Get or create user cart
    const cartId = await getOrCreateCart(userId);

    // 5. Check if item is already in cart to calculate proposed total quantity
    const existingItemResult = await pool.query(
      'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, parsedProductId]
    );

    const currentQtyInCart = existingItemResult.rows.length > 0
      ? existingItemResult.rows[0].quantity
      : 0;

    const proposedTotalQty = currentQtyInCart + parsedQuantity;

    // 6. Check available stock
    if (proposedTotalQty > product.stock) {
      return res.status(409).json({
        message: `Insufficient stock. Requested quantity (${proposedTotalQty}) exceeds available stock (${product.stock}).`
      });
    }

    // 7. PostgreSQL UPSERT: Add new item or increment existing quantity
    const upsertQuery = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, cart_id, product_id, quantity;
    `;

    const upsertResult = await pool.query(upsertQuery, [
      cartId,
      parsedProductId,
      parsedQuantity
    ]);

    return res.status(201).json({
      message: 'Product added to cart successfully.',
      item: upsertResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      message: 'Server error while adding product to cart.'
    });
  }
});

/**
 * PATCH /api/cart/items/:id
 * Update quantity of a specific cart item. Enforces cart ownership and stock limits.
 * Body: { quantity }
 */
router.patch('/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;

    if (isNaN(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        message: 'Invalid cart item ID.'
      });
    }

    // Validate quantity parameter (must be positive integer)
    const parsedQuantity = parseInt(quantity, 10);
    if (
      isNaN(parsedQuantity) ||
      parsedQuantity <= 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer greater than 0.'
      });
    }

    // Verify ownership: ensure cart item belongs to authenticated user's cart
    const itemQuery = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, p.stock, p.name
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1 AND c.user_id = $2
    `;

    const itemResult = await pool.query(itemQuery, [cartItemId, userId]);

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Cart item not found or does not belong to your cart.'
      });
    }

    const itemInfo = itemResult.rows[0];

    // Verify requested quantity does not exceed product stock
    if (parsedQuantity > itemInfo.stock) {
      return res.status(409).json({
        message: `Cannot update quantity. Requested quantity (${parsedQuantity}) exceeds available stock (${itemInfo.stock}).`
      });
    }

    // Update quantity in PostgreSQL
    const updateResult = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, product_id, quantity`,
      [parsedQuantity, cartItemId]
    );

    return res.status(200).json({
      message: 'Cart item quantity updated successfully.',
      item: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return res.status(500).json({
      message: 'Server error while updating cart item quantity.'
    });
  }
});

/**
 * DELETE /api/cart/items/:id
 * Remove an individual item from the authenticated user's cart.
 */
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id, 10);

    if (isNaN(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        message: 'Invalid cart item ID.'
      });
    }

    // Delete item ensuring ownership check via subquery on carts
    const deleteQuery = `
      DELETE FROM cart_items
      WHERE id = $1 AND cart_id = (SELECT id FROM carts WHERE user_id = $2)
      RETURNING id
    `;

    const deleteResult = await pool.query(deleteQuery, [cartItemId, userId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Cart item not found or does not belong to your cart.'
      });
    }

    return res.status(200).json({
      message: 'Item removed from cart successfully.'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({
      message: 'Server error while removing item from cart.'
    });
  }
});

/**
 * DELETE /api/cart
 * Clear all items from the current user's persistent cart. Cart table row remains.
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all cart items belonging to the user's cart
    await pool.query(
      `DELETE FROM cart_items
       WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
      [userId]
    );

    return res.status(200).json({
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      message: 'Server error while clearing cart.'
    });
  }
});

export default router;
