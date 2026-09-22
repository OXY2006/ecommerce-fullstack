import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="py-16 max-w-lg mx-auto text-center space-y-6">
      {/* Checkmark Icon */}
      <div className="bg-emerald-100 border border-emerald-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Order Placed Successfully!</h1>
        <p className="text-slate-500 text-sm">
          Thank you for your purchase. Your order has been registered in the database and product stock has been updated.
        </p>
      </div>

      {order ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide">
            Order Summary Details
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-bold text-indigo-600">#{order.id}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Status:</span>
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded capitalize">
                {order.status}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-extrabold text-slate-900 text-base">
                ${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}
              </span>
            </div>

            {order.createdAt && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Order Date:</span>
                <span className="text-slate-700 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-4 rounded-lg text-xs text-slate-500">
          Order completed successfully.
        </div>
      )}

      <div>
        <Link
          to="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg text-sm transition shadow"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
