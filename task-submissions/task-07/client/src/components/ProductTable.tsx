import type { Product } from '../api/types';
import { formatAmount } from '../lib/format';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <table className="ledger">
      <caption className="visually-hidden">Inventory products</caption>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">SKU</th>
          <th scope="col">Category</th>
          <th scope="col">Supplier</th>
          <th scope="col" className="num">
            Price
          </th>
          <th scope="col" className="num">
            In stock
          </th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <th scope="row" data-label="Product">
              {product.name}
            </th>
            <td data-label="SKU">{product.sku}</td>
            <td data-label="Category">{product.category?.name ?? 'Unknown'}</td>
            <td data-label="Supplier">{product.supplier?.name ?? 'Unknown'}</td>
            <td data-label="Price" className="num">
              {formatAmount(product.price)}
            </td>
            <td data-label="In stock" className="num">
              {product.quantity}
              {product.quantity === 0 && <span className="badge">Out of stock</span>}
            </td>
            <td data-label="Actions" className="row-actions">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product.name}`}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-small btn-danger-outline"
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product.name}`}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
