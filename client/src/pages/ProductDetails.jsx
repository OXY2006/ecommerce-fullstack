import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${id}`);

        if (response.status === 404) {
          setProduct(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(`Failed to fetch product #${id}:`, err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [id]);

  return (
    <div className="py-6 space-y-6">
      <Link
        to="/products"
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
      >
        &larr; Back to Products
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Fetching product details...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center space-y-3">
          <h2 className="text-xl font-bold">Error Loading Product</h2>
          <p className="text-sm">{error}</p>
          <div>
            <Link
              to="/products"
              className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Not Found State (404) */}
      {!loading && !error && !product && (
        <div className="text-center py-16 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-slate-500">
            The product you are looking for does not exist in our PostgreSQL database.
          </p>
          <div>
            <Link
              to="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded transition"
            >
              &larr; Back to Products
            </Link>
          </div>
        </div>
      )}

      {/* Success State — Product Details Card */}
      {!loading && !error && product && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="h-80 md:h-96 rounded-lg overflow-hidden bg-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded">
                {product.category || 'General'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {product.name}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded font-medium ${
                    product.stock > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                </span>
              </div>

              {/* Disabled Add to Cart placeholder button */}
              <button
                disabled
                className="w-full bg-slate-300 text-slate-500 cursor-not-allowed font-medium py-3 px-4 rounded text-center transition"
              >
                Add to Cart (Coming on Day 5)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
