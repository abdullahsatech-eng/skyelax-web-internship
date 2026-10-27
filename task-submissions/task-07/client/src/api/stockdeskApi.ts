import { request } from './http';
import type { Category, Product, ProductInput, Supplier } from './types';

export const fetchProducts = () => request<Product[]>('/api/products');
export const fetchCategories = () => request<Category[]>('/api/categories');
export const fetchSuppliers = () => request<Supplier[]>('/api/suppliers');

export const createProduct = (input: ProductInput) =>
  request<Product>('/api/products', { method: 'POST', body: JSON.stringify(input) });

export const updateProduct = (id: string, input: ProductInput) =>
  request<Product>(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteProduct = (id: string) =>
  request<void>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
