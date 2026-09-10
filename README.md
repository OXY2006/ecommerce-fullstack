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
* Connected React frontend to backend using native `fetch()` API with loading, error, and 404 states.

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
