import { Link } from 'react-router-dom';

export default function Cart() {
  return (
    <div className="py-16 text-center space-y-4 max-w-md mx-auto">
      <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-slate-400">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h1>
      <p className="text-slate-500 text-sm">
        Looks like you haven't added any items to your cart yet. Full cart features will arrive on Day 5!
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
