import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function Products() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse through our full catalog of mock products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
