import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/products — Fetch all products with category names
router.get('/products', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price::float AS price, 
        p.image, 
        p.stock, 
        p.created_at,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `;

    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while retrieving products' });
  }
});

// GET /api/products/:id — Fetch a single product by ID
router.get('/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  // Validate ID parameter
  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const queryText = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price::float AS price, 
        p.image, 
        p.stock, 
        p.created_at,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;

    // Parameterized query using [productId] prevents SQL Injection
    const { rows } = await pool.query(queryText, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching product #${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while retrieving product details' });
  }
});

export default router;
