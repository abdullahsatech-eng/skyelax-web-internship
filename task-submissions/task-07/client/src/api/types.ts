export interface Reference {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  category: Reference | null;
  supplier: Reference | null;
  /** Decimal string such as "24.50" - never converted to a float. */
  price: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends Reference {
  description?: string;
}

export interface Supplier extends Reference {
  email?: string;
  phone?: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: string;
  quantity: number;
}

export interface FieldDetail {
  field: string;
  message: string;
}
