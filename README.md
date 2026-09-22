# ShopSphere — E-Commerce Full Stack

A step-by-step full-stack e-commerce learning project built from scratch.

---

## Current Progress

### Day 1 — Project Foundation and Frontend
* Established clean project structure separating `client` and `server`.
* Built frontend with React (Vite), React Router, and Tailwind CSS.
* Created page routing (`/`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`, `/admin`).
* Created a lightweight Node.js + Express backend with a `/api/health` endpoint.

### Day 2 — PostgreSQL + Product API Integration
* Replaced temporary mock data with a real **PostgreSQL** database.
* Utilized the native Node.js **`pg`** database driver (No ORM / No Prisma).
* Designed SQL tables for **`categories`** and **`products`** with foreign key constraints (`server/sql/schema.sql`).
* Created SQL seed file (`server/sql/seed.sql`) inserting Day 1 categories and product data.
* Implemented reusable PostgreSQL connection pooling in `server/src/db.js`.
* Created REST API endpoints in Express:
  * `GET /api/products` (Fetches all products with category names using SQL `JOIN`)
  * `GET /api/products/:id` (Fetches single product details using parameterized query `$1`)
* Configured Vite development proxy in `client/vite.config.js` to route `/api` requests to backend port `5000`.
### Day 3 — Search, Filtering, Sorting, & Server-Side Pagination
* Implemented dynamic PostgreSQL querying via Express REST API for:
  * **Product Search**: `GET /api/products?search=watch` (ILIKE search on `p.name`)
  * **Category Filtering**: `GET /api/products?category=Electronics` (`JOIN categories` filtering)
  * **Sorting Whitelist**: `GET /api/products?sort=price_asc` (`price_asc`, `price_desc`, `newest`)
  * **Server-Side Pagination**: `GET /api/products?page=1&limit=6` (Calculates SQL `LIMIT` & `OFFSET` and returns filtered total count)
* Created `GET /api/categories` endpoint for dynamic filter options.
* Synchronized React frontend state with browser URL search parameters using React Router `useSearchParams()`.
* Implemented automatic page reset (`page=1`) when search/filters change.

### Day 4 — User Authentication & Authorization
* **Database Schema Update**: Added `users` table (`id`, `name`, `email`, `password`, `role`, `created_at`) with unique email constraint in `server/sql/schema.sql`.
* **Password Hashing**: Secured user passwords with `bcryptjs` hashing (10 salt rounds) during registration; never store plaintext passwords.
* **REST Authentication Endpoints**:
  * `POST /api/auth/register`: Validates input, normalizes email, checks for duplicates, hashes password, inserts user into PostgreSQL, returns user profile (201 Created).
  * `POST /api/auth/login`: Authenticates email and password using `bcrypt.compare`, signs JSON Web Token (JWT), and returns JWT + user info (200 OK). Returns generic 401 for bad credentials.
  * `GET /api/auth/me`: Protected route returning authenticated user profile based on JWT verification.
  * `GET /api/auth/admin-test`: Protected route requiring `admin` role authorization.
* **JWT & Middleware**:
  * Express `authenticateToken` middleware verifies `Authorization: Bearer <token>` header using `JWT_SECRET`.
  * Express `requireAdmin` middleware enforces role-based access control (403 Forbidden for non-admin users).
* **Frontend Authentication State**:
  * Built lightweight React `AuthContext` to manage `user`, `token`, and `loading` state across the application.
  * Persisted JWT in `localStorage` and automatically restored user sessions on page reload via `GET /api/auth/me`.
  * Protected `/admin` frontend route using `<ProtectedRoute adminOnly={true}>`.
  * Dynamic Navbar reflecting user authentication status, user name, role badge, and client-side logout functionality.

### Day 5 — Persistent Shopping Cart
* **Database Design**: Added `carts` (1-to-1 with `users`) and `cart_items` tables with foreign key `ON DELETE CASCADE` and `UNIQUE(cart_id, product_id)` constraint in `server/sql/schema.sql`.
* **Cart Creation & Laziness**: Implemented lazy cart initialization on backend via `getOrCreateCart(userId)`.
* **REST Cart API Endpoints**:
  * `GET /api/cart`: Fetches authenticated user's cart items with SQL `JOIN` on products and server-calculated subtotals and totals.
  * `POST /api/cart/items`: Adds item to cart or increments quantity via PostgreSQL `ON CONFLICT` UPSERT. Validates quantity and available product stock.
  * `PATCH /api/cart/items/:id`: Updates item quantity while enforcing user ownership and stock limits.
  * `DELETE /api/cart/items/:id`: Removes single cart item owned by current user.
  * `DELETE /api/cart`: Clears all cart items for authenticated user while leaving cart table row intact.
* **Cart Ownership & Security**: User identity derived strictly from JWT (`req.user.id`). Frontend never passes `user_id`. Prices and totals are computed on backend.
* **Frontend Integration**: Built responsive Cart page (`Cart.jsx`), quantity controls, item removal, clear cart, unauthenticated login redirect, loading/error states, and Add to Cart buttons on Product Cards and Details page.

### Day 6 — Checkout & Order Creation Flow
* **Database Design**: Added `orders` (`user_id`, `total_amount`, `status`, shipping fields) and `order_items` (`order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`) tables to `server/sql/schema.sql`.
* **Cart vs. Order Separation**: Cart represents dynamic temporary state; Order represents immutable historical purchase records.
* **Price Snapshotting**: `order_items.price` and `order_items.product_name` snapshot item details at time of checkout so future product price changes or deletion do not affect historical orders.
* **PostgreSQL Database Transactions**: Implemented atomic transaction via `pool.connect()` using `BEGIN`, `COMMIT`, and `ROLLBACK` for order creation endpoint `POST /api/orders`.
* **Server-Side Order Calculation & Stock Validation**:
  1. Authenticates JWT (`req.user.id`).
  2. Validates all shipping address fields.
  3. Verifies cart is non-empty.
  4. Verifies product stock availability (`quantity <= stock`).
  5. Computes order total and subtotals strictly on the backend.
  6. Inserts `orders` and `order_items` records.
  7. Decreases product stock (`stock = stock - quantity`).
  8. Clears user's cart items while retaining cart table record.
  9. Commits transaction or rolls back atomically on failure.
* **Frontend Checkout Flow**: Built protected Checkout page (`Checkout.jsx`) with shipping form and order summary, and Order Success confirmation page (`OrderSuccess.jsx`).

---

## Technology Stack

* **Frontend**: React, React Router, Tailwind CSS, Vite
* **Backend**: Node.js, Express, REST API
* **Database**: PostgreSQL (Driver: `pg`)
* **Version Control**: Git / GitHub

---

## Project Structure

```text
ecommerce-fullstack/
├── client/              # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/  # Navbar, Footer, ProductCard
│   │   ├── pages/       # Home, Products, ProductDetails, Cart, Login, Register, Admin
│   │   ├── App.jsx      # Route configurations & Layout
│   │   └── main.jsx     # Entry point & BrowserRouter
│   ├── vite.config.js   # Vite config with API proxy
│   └── package.json
│
├── server/              # Node.js + Express Backend
│   ├── src/
│   │   ├── db.js        # PostgreSQL pool connection
│   │   ├── routes/
│   │   │   └── productRoutes.js # REST API endpoints (/api/products)
│   │   └── server.js    # Express app & middleware
│   ├── sql/
│   │   ├── schema.sql   # DDL for categories & products tables
│   │   ├── seed.sql     # Initial product & category data
│   │   └── setup_db.js  # Automated DB creation script
│   ├── .env             # Local environment variables (Ignored by Git)
│   ├── .env.example     # Environment variable template
│   └── package.json
│
├── .env.example         # Root environment template
├── .gitignore           # Git ignore configuration
└── README.md
```

---

## Getting Started & Database Setup

### 1. Configure Environment Variables
Copy `.env.example` to `.env` inside `server/` and update your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/ecommerce_db"
PORT=5000
JWT_SECRET="your_jwt_secret_key_here"
```

### 2. Set Up PostgreSQL Database
Run the setup script to automatically create `ecommerce_db`, apply `schema.sql`, and seed data:

```bash
cd server
npm run db:setup
```

Or run SQL files manually via `psql`:

```bash
psql -U postgres -d ecommerce_db -f sql/schema.sql
psql -U postgres -d ecommerce_db -f sql/seed.sql
```

### 3. Run Backend Server
Start the Express API server:

```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`.

### 4. Run Frontend Server
In a separate terminal, start the React development server:

```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`.
