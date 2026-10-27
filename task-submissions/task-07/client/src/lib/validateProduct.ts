export interface ProductFormValues {
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: string;
  quantity: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PRICE_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;
const QUANTITY_PATTERN = /^\d{1,9}$/;

/** Mirrors the server rules for fast feedback. The server remains the authority. */
export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const name = values.name.trim();
  const sku = values.sku.trim();
  const price = values.price.trim();
  const quantity = values.quantity.trim();

  if (!name) errors.name = 'Enter a product name.';
  else if (name.length > 120) errors.name = 'Product name must be 120 characters or fewer.';

  if (!sku) errors.sku = 'Enter a SKU.';
  else if (sku.length > 40) errors.sku = 'SKU must be 40 characters or fewer.';
  else if (!SKU_PATTERN.test(sku)) errors.sku = 'Use only letters, numbers, dots, hyphens and underscores.';

  if (!values.categoryId) errors.categoryId = 'Choose a category.';
  if (!values.supplierId) errors.supplierId = 'Choose a supplier.';

  if (!price) errors.price = 'Enter a price.';
  else if (price.startsWith('-')) errors.price = 'Price cannot be negative.';
  else if (!PRICE_PATTERN.test(price)) errors.price = 'Enter an amount like 12.50 (up to 2 decimal places).';

  if (!quantity) errors.quantity = 'Enter a quantity.';
  else if (quantity.startsWith('-')) errors.quantity = 'Quantity cannot be negative.';
  else if (!QUANTITY_PATTERN.test(quantity)) errors.quantity = 'Quantity must be a whole number.';

  return errors;
}
