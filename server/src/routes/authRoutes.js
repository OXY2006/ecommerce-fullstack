import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * PART 3 — REGISTRATION API
 * POST /api/auth/register
 * Request Body: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 2. Normalize email (trim whitespace and convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check whether the email already exists in PostgreSQL
    const existingUserCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUserCheck.rows.length > 0) {
      return res.status(409).json({
        message: 'User with this email already exists.'
      });
    }

    // 4. Hash the password using bcrypt with 10 salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Insert the new user with default role 'user'
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const newUser = insertResult.rows[0];

    // 6. Return response (201 Created) without sending password or password hash
    return res.status(201).json({
      message: 'User registered successfully.',
      user: newUser
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({
      message: 'Server error during registration.'
    });
  }
});

/**
 * PART 4 — LOGIN API
 * POST /api/auth/login
 * Request Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user in database by email
    const userResult = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      // Generic message to prevent email enumeration
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];

    // 4. Compare entered password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // 5. Generate JWT authentication token
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const payload = {
      id: user.id,
      role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    // 6. Return token and safe user info (NO password/hash)
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during user login:', error);
    return res.status(500).json({
      message: 'Server error during login.'
    });
  }
});

/**
 * PART 7 — CURRENT USER ENDPOINT
 * GET /api/auth/me
 * Protected Route (Requires valid Authorization: Bearer <token>)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Read authenticated user ID from req.user (populated by authenticateToken middleware)
    const userId = req.user.id;

    const userResult = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found.'
      });
    }

    return res.status(200).json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return res.status(500).json({
      message: 'Server error fetching user profile.'
    });
  }
});

/**
 * PART 15 — ADMIN AUTHORIZATION TEST ENDPOINT
 * GET /api/auth/admin-test
 * Protected Route (Requires valid JWT AND admin role)
 */
router.get('/admin-test', authenticateToken, requireAdmin, (req, res) => {
  return res.status(200).json({
    message: 'Authorization successful: Welcome to the admin portal!',
    user: req.user
  });
});

export default router;
