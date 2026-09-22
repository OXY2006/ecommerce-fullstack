import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);

  // Shipping form state
  const [formData, setFormData] = useState({
    shippingName: user?.name || '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch current user's cart on component mount
  useEffect(() => {
    async function fetchCart() {
      if (!token) {
        setLoadingCart(false);
        return;
      }

      try {
        setLoadingCart(true);
        setCartError(null);

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
        console.error('Error fetching cart for checkout:', err);
        setCartError(err.message || 'Failed to load cart items.');
      } finally {
        setLoadingCart(false);
      }
    }

    fetchCart();
  }, [token]);

  // Update form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Form Submission -> POST /api/orders
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation check
    if (
      !formData.shippingName.trim() ||
      !formData.shippingAddress.trim() ||
      !formData.shippingCity.trim() ||
      !formData.shippingState.trim() ||
      !formData.shippingPostalCode.trim()
    ) {
      setSubmitError('Please fill out all required shipping fields.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingName: formData.shippingName.trim(),
          shippingAddress: formData.shippingAddress.trim(),
          shippingCity: formData.shippingCity.trim(),
          shippingState: formData.shippingState.trim(),
          shippingPostalCode: formData.shippingPostalCode.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order.');
      }

      // Successful Order Creation -> Redirect to /order-success passing created order payload
      navigate('/order-success', {
        state: { order: data.order },
        replace: true
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loadingCart) {
    return (
      <div className="py-16 text-center space-y-3 max-w-md mx-auto">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 text-sm font-medium">Preparing your checkout details...</p>
      </div>
    );
  }

  // Error state fetching cart
  if (cartError) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-3">
          <h2 className="text-xl font-bold">Failed to load checkout</h2>
          <p className="text-sm">{cartError}</p>
          <Link
            to="/cart"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded text-xs transition"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl space-y-3">
          <h2 className="text-xl font-bold">Your Cart is Empty</h2>
          <p className="text-sm">You must add items to your cart before proceeding to checkout.</p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-md text-sm transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">
            Provide your shipping details and review your order before placing it.
          </p>
        </div>
        <Link
          to="/cart"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          &larr; Return to Cart
        </Link>
      </div>

      {/* Error notification banner */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>⚠️ {submitError}</span>
          <button
            onClick={() => setSubmitError(null)}
            className="text-xs font-bold text-red-600 hover:text-red-800 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping Address Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📦</span> Shipping Information
          </h2>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="shippingName" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shippingName"
                name="shippingName"
                required
                placeholder="e.g. John Doe"
                value={formData.shippingName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="shippingAddress" className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shippingAddress"
                name="shippingAddress"
                required
                placeholder="e.g. 123 Main Street, Apt 4B"
                value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingCity" className="block text-xs font-semibold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shippingCity"
                  name="shippingCity"
                  required
                  placeholder="e.g. Amaravati"
                  value={formData.shippingCity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="shippingState" className="block text-xs font-semibold text-slate-700 mb-1">
                  State / Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shippingState"
                  name="shippingState"
                  required
                  placeholder="e.g. Andhra Pradesh"
                  value={formData.shippingState}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="shippingPostalCode" className="block text-xs font-semibold text-slate-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shippingPostalCode"
                name="shippingPostalCode"
                required
                placeholder="e.g. 522503"
                value={formData.shippingPostalCode}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Payment Method Notice */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>💳</span> Payment Method: <span className="text-indigo-600 font-bold">Cash on Delivery (COD)</span>
            </div>
            <p className="text-xs text-slate-400">
              Demo mode: No actual payment processing or card verification is required for Day 6.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🛒</span> Order Summary ({items.length} items)
            </h2>

            {/* Item List */}
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total Amount:</span>
                <span className="text-indigo-600 text-xl">${cart.total.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Backend will recalculate actual total from PostgreSQL database prices.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition shadow-md disabled:opacity-50 text-center cursor-pointer text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Transaction...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
