import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">ShopSphere</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Your beginner-friendly, full-stack online catalog created step-by-step.
          </p>
        </div>

        <nav className="flex gap-4 text-xs">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/products" className="hover:text-white transition">Products</Link>
          <Link to="/cart" className="hover:text-white transition">Cart</Link>
        </nav>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
