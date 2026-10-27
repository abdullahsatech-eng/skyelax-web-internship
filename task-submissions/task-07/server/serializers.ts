import type { Types } from 'mongoose';
import { centsToPrice } from './utils/money';

export interface ReferenceNames {
  categories: Map<string, string>;
  suppliers: Map<string, string>;
}

/** Shape of a lean product document as it comes back from MongoDB. */
export interface ProductRecord {
  _id: Types.ObjectId;
  name: string;
  sku: string;
  categoryId: Types.ObjectId;
  supplierId: Types.ObjectId;
  priceCents: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeProduct(product: ProductRecord, refs: ReferenceNames) {
  const categoryId = product.categoryId.toString();
  const supplierId = product.supplierId.toString();
  const categoryName = refs.categories.get(categoryId);
  const supplierName = refs.suppliers.get(supplierId);

  return {
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    categoryId,
    supplierId,
    category: categoryName === undefined ? null : { id: categoryId, name: categoryName },
    supplier: supplierName === undefined ? null : { id: supplierId, name: supplierName },
    price: centsToPrice(product.priceCents),
    quantity: product.quantity,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
