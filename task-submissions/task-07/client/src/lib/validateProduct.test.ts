import { describe, expect, it } from 'vitest';
import { validateProduct, type ProductFormValues } from './validateProduct';

const valid: ProductFormValues = {
  name: 'Desk Lamp',
  sku: 'LAMP-001',
  categoryId: 'c1',
  supplierId: 's1',
  price: '24.50',
  quantity: '12',
};

describe('validateProduct (client-side)', () => {
  it('accepts valid values, including zero', () => {
    expect(validateProduct(valid)).toEqual({});
    expect(validateProduct({ ...valid, price: '0', quantity: '0' })).toEqual({});
  });

  it('requires every field', () => {
    const errors = validateProduct({ name: '', sku: '', categoryId: '', supplierId: '', price: '', quantity: '' });
    expect(Object.keys(errors).sort()).toEqual(['categoryId', 'name', 'price', 'quantity', 'sku', 'supplierId']);
  });

  it('rejects negative price and quantity', () => {
    expect(validateProduct({ ...valid, price: '-1' }).price).toBe('Price cannot be negative.');
    expect(validateProduct({ ...valid, quantity: '-1' }).quantity).toBe('Quantity cannot be negative.');
  });

  it('rejects fractional quantity and over-precise price', () => {
    expect(validateProduct({ ...valid, quantity: '1.5' }).quantity).toBe('Quantity must be a whole number.');
    expect(validateProduct({ ...valid, price: '1.999' }).price).toMatch(/up to 2 decimal/);
  });

  it('rejects SKUs with unsupported characters', () => {
    expect(validateProduct({ ...valid, sku: 'bad sku!' }).sku).toMatch(/letters, numbers/);
  });
});
