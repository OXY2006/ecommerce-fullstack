import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const productList = Array.isArray(data) ? data : (data.products || []);
          setFeaturedProducts(productList.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl my-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Day 2 PostgreSQL + REST API
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Quality Everyday Essentials
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to ShopSphere — now powered by a live PostgreSQL database and Node.js Express REST API backend.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              Shop Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Featured Products</h2>
            <p className="text-slate-500 text-sm">Top selections retrieved from PostgreSQL database</p>
          </div>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
          >
            View All Products &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">Loading featured products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
