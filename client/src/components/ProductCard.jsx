import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent accidental navigation if nested

    // 1. Check authentication: If user is not logged in, redirect to /login
    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      setErrorMsg(null);

      // 2. Make authenticated POST request to backend API
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      // 3. UI feedback
      setButtonText('Added! ✓');
      setTimeout(() => {
        setButtonText('Add to Cart');
      }, 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
        <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {product.category}
        </span>
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-base mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-slate-900">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-red-600 font-medium mb-2 text-center bg-red-50 p-1 rounded border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product.id}`}
              className="text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2 px-2 rounded transition flex items-center justify-center"
            >
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className={`font-medium text-xs py-2 px-2 rounded transition flex items-center justify-center cursor-pointer ${
                buttonText === 'Added! ✓'
                  ? 'bg-emerald-600 text-white'
                  : product.stock > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {adding ? 'Adding...' : product.stock <= 0 ? 'Out of Stock' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
