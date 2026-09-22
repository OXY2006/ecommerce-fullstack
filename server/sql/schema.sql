-- Drop tables if they exist to allow clean resets (in dependency order)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Category Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Product Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cart Table (1-to-1 relationship with User)
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CartItem Table (Connects Cart and Product with quantity)
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- 6. Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipping_name VARCHAR(255) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. OrderItems Table (Snapshots product details & price at purchase time)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


