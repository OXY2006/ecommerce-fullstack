import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <NavLink to="/" className="text-xl font-bold tracking-wide text-indigo-400 hover:text-indigo-300 transition">
          ShopSphere
        </NavLink>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-3 text-sm font-medium overflow-x-auto py-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            Cart
          </NavLink>

          {/* Admin link visible to logged-in admins */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Admin
            </NavLink>
          )}

          {/* Conditional rendering based on user login state */}
          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
              <span className="text-xs text-slate-300 font-medium px-2 py-1 bg-slate-800 rounded flex items-center gap-1">
                👤 {user.name || user.email}
                {user.role === 'admin' && (
                  <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded uppercase">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-indigo-400 hover:bg-slate-800 hover:text-indigo-300'
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
