import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart interaction state
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

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

  // Handle Add to Cart submission
  const handleAddToCart = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (!product || product.stock <= 0) return;

    try {
      setAdding(true);
      setFeedback(null);

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product to cart.');
      }

      setFeedback({
        type: 'success',
        message: `Successfully added ${quantity} unit(s) of "${product.name}" to your cart!`
      });
    } catch (err) {
      console.error('Error adding to cart from details page:', err);
      setFeedback({
        type: 'error',
        message: err.message
      });
    } finally {
      setAdding(false);
    }
  };

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

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <span>{feedback.message}</span>
                  <button
                    onClick={() => setFeedback(null)}
                    className="font-bold ml-2 underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Quantity Selector & Add to Cart Controls */}
              {product.stock > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || adding}
                        className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold transition rounded-l-lg cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 font-bold text-slate-900 text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock || adding}
                        className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold transition rounded-r-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg text-center transition shadow cursor-pointer disabled:opacity-50"
                  >
                    {adding ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-300 text-slate-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed text-center"
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
