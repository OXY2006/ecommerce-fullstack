import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function Home() {
  // Select first 4 products as featured products for Day 1
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl my-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Day 1 Frontend Foundation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Quality Everyday Essentials
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to ShopSphere — your step-by-step e-commerce platform. Explore modern products across electronics, fashion, home, and accessories.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Featured Products</h2>
            <p className="text-slate-500 text-sm">Handpicked top selections from our mock collection</p>
          </div>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
          >
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
