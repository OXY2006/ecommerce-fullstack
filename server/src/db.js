import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Create a PostgreSQL connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce_db',
});

// Log pool connection events in development
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database pool');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export default pool;
