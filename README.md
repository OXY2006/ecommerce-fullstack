# E-Commerce Full Stack

A beginner-friendly full-stack e-commerce project built step-by-step.

## Current Progress

**Day 1 — Project Foundation and Frontend**

* Established clean project structure separating `client` and `server`.
* Built frontend with React (Vite), React Router, and Tailwind CSS.
* Created mock product dataset for client-side rendering.
* Configured page routing (`/`, `/products`, `/products/:id`, `/cart`, `/login`, `/register`, `/admin`).
* Created a lightweight Node.js + Express backend with a `/api/health` endpoint.

> **IMPORTANT NOTE**: PostgreSQL and Prisma are **NOT** implemented in Day 1. The frontend currently operates using mock data in `src/data/products.js`. Database connection, Prisma ORM, and REST endpoints for data fetching will be integrated on Day 2.

---

## Planned Stack

* **Frontend**: React, React Router, Tailwind CSS
* **Backend**: Node.js, Express, REST API
* **Database & ORM** (Coming later): PostgreSQL, Prisma
* **Version Control**: Git / GitHub

---

## Project Structure

```text
ecommerce-fullstack/
├── client/              # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/  # Navbar, Footer, ProductCard
│   │   ├── pages/       # Home, Products, ProductDetails, Cart, Login, Register, Admin
│   │   ├── data/        # Mock product data
│   │   ├── App.jsx      # Route configurations & Layout
│   │   └── main.jsx     # Entry point & BrowserRouter
│   └── package.json
│
├── server/              # Node.js + Express Backend
│   ├── src/
│   │   └── server.js    # Express app & /api/health endpoint
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Running the Project

### 1. Running the Frontend

Navigate to the `client` directory and start the Vite development server:

```bash
cd client
npm run dev
```

The frontend will run at `http://localhost:5173`.

### 2. Running the Backend

In a separate terminal, navigate to the `server` directory and start the Express server:

```bash
cd server
npm run dev
```

The backend server will run at `http://localhost:5000`.

### 3. Testing Backend Health Endpoint

You can test the Express health endpoint by opening your browser or running:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "message": "API is running"
}
```
