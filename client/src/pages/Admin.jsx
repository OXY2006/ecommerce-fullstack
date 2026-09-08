export default function Admin() {
  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', price: 199.99, stock: 15 },
    { id: 2, name: 'Mechanical Watch', price: 149.50, stock: 8 },
    { id: 3, name: 'Ergonomic Office Chair', price: 249.00, stock: 5 }
  ];

  const sampleOrders = [
    { id: 'ORD-1001', customer: 'Alice Smith', total: 199.99, status: 'Pending' },
    { id: 'ORD-1002', customer: 'Bob Johnson', total: 398.50, status: 'Shipped' }
  ];

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Frontend layout preview for product and order management (Backend management coming later).
        </p>
      </div>

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
