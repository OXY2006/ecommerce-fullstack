import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/categories — Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const queryText = `SELECT id, name FROM categories ORDER BY id ASC`;
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while retrieving categories' });
  }
});

// GET /api/products — Fetch products with search, category filtering, sorting, & pagination
router.get('/products', async (req, res) => {
  try {
    const { search, category, sort, page: reqPage, limit: reqLimit } = req.query;

    // 1. Validate & sanitize pagination query parameters
    let page = parseInt(reqPage, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    let limit = parseInt(reqLimit, 10);
    if (isNaN(limit) || limit < 1) {
      limit = 6;
    }
    // Cap maximum limit to 20 items per page
    if (limit > 20) {
      limit = 20;
    }

    // 2. Build parameterized dynamic WHERE clause
    const whereClauses = [];
    const queryParams = [];

    // Search filter: Case-insensitive search on product name
    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim()}%`);
      whereClauses.push(`p.name ILIKE $${queryParams.length}`);
    }

    // Category filter: Filter by category name
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      queryParams.push(category.trim());
      whereClauses.push(`c.name ILIKE $${queryParams.length}`);
    }

    const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    // 3. Sorting whitelist (prevents SQL Injection in ORDER BY clause)
    const sortWhitelist = {
      price_asc: 'p.price ASC, p.id ASC',
      price_desc: 'p.price DESC, p.id ASC',
      newest: 'p.created_at DESC, p.id ASC'
    };

    const sortClause = sortWhitelist[sort] || sortWhitelist['newest'];

    // 4. Query total matching products count (for frontend pagination metadata)
    const countQueryText = `
      SELECT COUNT(*)::int AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
    `;

    const countResult = await pool.query(countQueryText, queryParams);
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Calculate database OFFSET for SQL query
    const offset = (page - 1) * limit;

    // 5. Query paginated products dataset
    const dataParams = [...queryParams, limit, offset];
    const limitParamIndex = queryParams.length + 1;
    const offsetParamIndex = queryParams.length + 2;

    const productsQueryText = `
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
      ${whereSql}
      ORDER BY ${sortClause}
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `;

    const { rows: products } = await pool.query(productsQueryText, dataParams);

    // 6. Return standard structured response object
    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
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
