import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to connect to the database API.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse through our full catalog powered by PostgreSQL.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading catalog from database...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm space-y-2">
          <h3 className="font-bold">Unable to load products</h3>
          <p>{error}</p>
          <p className="text-xs text-red-500">
            Please make sure your Express backend server and PostgreSQL database are running.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 p-8 rounded-lg text-center space-y-2">
          <h3 className="font-bold text-lg text-slate-800">No products available</h3>
          <p className="text-sm">The product database is currently empty. Run seed SQL script to populate items.</p>
        </div>
      )}

      {/* Success State — Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
