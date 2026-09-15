import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionItemId, setActionItemId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

  // Fetch cart from backend REST API
  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setActionError(null);

      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load cart (Status: ${response.status})`);
      }

      const data = await response.json();
      setCart(data.cart || { id: null, items: [], total: 0 });
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to load cart from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  // Update Item Quantity (PATCH /api/cart/items/:id)
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;

    try {
      setActionItemId(itemId);
      setActionError(null);

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      // Refresh cart state from backend
      await fetchCart();
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      setActionError(err.message);
    } finally {
      setActionItemId(null);
    }
  };

  // Remove Individual Cart Item (DELETE /api/cart/items/:id)
  const handleRemoveItem = async (itemId) => {
    try {
      setActionItemId(itemId);
      setActionError(null);

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }

      await fetchCart();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
      setActionError(err.message);
    } finally {
      setActionItemId(null);
    }
  };

  // Clear Entire Cart (DELETE /api/cart)
  const handleClearCart = async () => {
    try {
      setClearingCart(true);
      setActionError(null);

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }

      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setActionError(err.message);
    } finally {
      setClearingCart(false);
    }
  };

  // 1. Unauthenticated State: Prompt user to log in
  if (!user) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800">Authentication Required</h1>
        <p className="text-slate-500 text-sm">
          Please log in to your account to view and manage your persistent shopping cart.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-md text-sm transition cursor-pointer"
          >
            Log In
          </button>
          <Link
            to="/products"
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-md text-sm transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 max-w-md mx-auto">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 text-sm font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-3">
          <h2 className="text-xl font-bold">Failed to load cart</h2>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchCart}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded text-xs transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  // 4. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h1>
        <p className="text-slate-500 text-sm">
          You haven't added any products to your cart yet. Explore our catalog to find items you love!
        </p>

        <div className="pt-2">
          <Link
            to="/products"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-md text-sm transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 5. Success State: Render Cart Items Table and Totals
  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review your selected items saved in PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleClearCart}
          disabled={clearingCart || actionItemId !== null}
          className="self-start sm:self-auto text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          {clearingCart ? 'Clearing...' : 'Clear Cart'}
        </button>
      </div>

      {/* Action Error Notification */}
      {actionError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-lg text-sm flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-amber-600 hover:text-amber-900 font-bold ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Product</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map((item) => {
                const isUpdating = actionItemId === item.id;
                const isAtStockLimit = item.quantity >= item.stock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    {/* Product Column */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-semibold text-slate-800 hover:text-indigo-600 transition line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs text-slate-400">
                            Available Stock: {item.stock}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="py-4 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Quantity Controls */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-slate-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating || isAtStockLimit}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      {isAtStockLimit && (
                        <div className="text-[10px] text-amber-600 font-medium mt-1">
                          Max stock
                        </div>
                      )}
                    </td>

                    {/* Subtotal */}
                    <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${item.subtotal.toFixed(2)}
                    </td>

                    {/* Action (Remove) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded transition disabled:opacity-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cart Total Summary Section */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Link
              to="/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              &larr; Continue Shopping
            </Link>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-right w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-6 text-lg font-bold text-slate-900">
              <span className="text-slate-600 text-base font-normal">Cart Total:</span>
              <span className="text-2xl font-extrabold text-indigo-600">
                ${cart.total.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Calculated on backend from PostgreSQL database prices.
            </p>

            <button
              disabled
              className="w-full sm:w-auto mt-2 bg-slate-300 text-slate-500 font-medium px-6 py-2.5 rounded-lg text-sm cursor-not-allowed text-center"
            >
              Checkout (Coming on Day 6)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
