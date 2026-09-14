import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, token } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', price: 199.99, stock: 15 },
    { id: 2, name: 'Mechanical Watch', price: 149.50, stock: 8 },
    { id: 3, name: 'Ergonomic Office Chair', price: 249.00, stock: 5 }
  ];

  const sampleOrders = [
    { id: 'ORD-1001', customer: 'Alice Smith', total: 199.99, status: 'Pending' },
    { id: 'ORD-1002', customer: 'Bob Johnson', total: 398.50, status: 'Shipped' }
  ];

  const testAdminApi = async () => {
    setLoadingTest(true);
    try {
      const response = await fetch('/api/auth/admin-test', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTestResult({
        status: response.status,
        message: data.message,
        user: data.user
      });
    } catch (err) {
      setTestResult({
        status: 500,
        message: 'Failed to test admin API route.'
      });
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-900 text-white p-6 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Welcome back, <strong>{user?.name || user?.email}</strong> (Role: <span className="uppercase font-mono bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded text-xs">{user?.role}</span>)
          </p>
        </div>

        {/* Live Admin Endpoint Test Button */}
        <div>
          <button
            onClick={testAdminApi}
            disabled={loadingTest}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-indigo-400 transition cursor-pointer"
          >
            {loadingTest ? 'Testing Endpoint...' : '⚡ Test Admin API Route (GET /api/auth/admin-test)'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl text-xs space-y-1 font-mono border ${
          testResult.status === 200
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          <p><strong>Response Status:</strong> {testResult.status} {testResult.status === 200 ? 'OK' : 'Forbidden/Error'}</p>
          <p><strong>Backend Message:</strong> {testResult.message}</p>
        </div>
      )}

      {/* Products Table Placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Products Overview</h2>
          <button disabled className="bg-slate-200 text-slate-500 cursor-not-allowed text-xs font-semibold px-3 py-1.5 rounded">
            + Add Product (Placeholder)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold bg-slate-50">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">${p.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-600">{p.stock}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button disabled className="text-slate-400 cursor-not-allowed text-xs hover:underline">Edit</button>
                    <button disabled className="text-slate-400 cursor-not-allowed text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Table Placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Recent Orders Overview</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold bg-slate-50">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{o.id}</td>
                  <td className="py-3 px-4 text-slate-600">{o.customer}</td>
                  <td className="py-3 px-4 text-slate-600">${o.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-medium">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
