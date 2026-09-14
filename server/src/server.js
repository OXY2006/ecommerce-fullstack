import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check endpoint for Day 1
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API is running'
  });
});

// Product routes for Day 2 & Day 3
app.use('/api', productRoutes);

// Authentication routes for Day 4
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
