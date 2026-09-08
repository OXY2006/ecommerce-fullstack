import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
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
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
