import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';

export default function ProductDetails() {
  const { id } = useParams();

  // Find product by matching numerical ID
  const product = products.find((item) => item.id === Number(id));

  // Handle invalid product ID
  if (!product) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500">
          The product you are looking for does not exist or has been removed.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded transition"
          >
            &larr; Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <Link
        to="/products"
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
      >
        &larr; Back to Products
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Product Image */}
        <div className="h-80 md:h-96 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded font-medium ${
                  product.stock > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
              </span>
            </div>

            {/* Disabled Add to Cart placeholder button */}
            <button
              disabled
              className="w-full bg-slate-300 text-slate-500 cursor-not-allowed font-medium py-3 px-4 rounded text-center transition"
            >
              Add to Cart (Coming on Day 5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
