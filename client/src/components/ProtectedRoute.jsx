import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        Loading session...
      </div>
    );
  }

  // Part 13 — Redirect unauthenticated users to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Part 14 — Check user role for admin authorization
  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <h2 className="text-xl font-bold text-red-700">403 Forbidden</h2>
          <p className="text-sm text-red-600">
            Access denied. You need an <strong>admin</strong> role to view this page.
          </p>
          <div className="pt-2">
            <span className="inline-block bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded">
              Current Role: <strong>{user.role}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
