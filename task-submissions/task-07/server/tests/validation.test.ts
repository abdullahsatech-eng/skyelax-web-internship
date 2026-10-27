import { describe, expect, it } from 'vitest';
import { productInputSchema } from '../src/validation/product';

const valid = {
  name: '  Desk Lamp ',
  sku: ' lamp-001 ',
  categoryId: '64b7f0c2a1b2c3d4e5f60718',
  supplierId: '64b7f0c2a1b2c3d4e5f60719',
  price: '24.50',
  quantity: 12,
};

function messagesFor(input: unknown): string[] {
  const result = productInputSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe('productInputSchema', () => {
  it('accepts a valid product and normalises name and SKU', () => {
    const parsed = productInputSchema.parse(valid);
    expect(parsed.name).toBe('Desk Lamp');
    expect(parsed.sku).toBe('LAMP-001');
    expect(parsed.price).toBe('24.50');
  });

  it('accepts a numeric price and zero values', () => {
    const parsed = productInputSchema.parse({ ...valid, price: 0, quantity: 0 });
    expect(parsed.price).toBe('0');
    expect(parsed.quantity).toBe(0);
  });

  it('rejects missing required fields', () => {
    expect(messagesFor({})).toEqual(
      expect.arrayContaining([
        'Product name is required.',
        'SKU is required.',
        'Category is required.',
        'Supplier is required.',
        'Quantity is required.',
      ]),
    );
  });

  it('rejects blank name and SKU after trimming', () => {
    const messages = messagesFor({ ...valid, name: '   ', sku: '  ' });
    expect(messages).toContain('Product name is required.');
    expect(messages).toContain('SKU is required.');
  });

  it('rejects a negative price', () => {
    expect(messagesFor({ ...valid, price: '-1' }).join(' ')).toMatch(/Price must be zero or more/);
    expect(messagesFor({ ...valid, price: -5 }).join(' ')).toMatch(/Price must be zero or more/);
  });

  it('rejects prices with more than 2 decimals or non-numeric text', () => {
    expect(messagesFor({ ...valid, price: '1.234' })).not.toHaveLength(0);
    expect(messagesFor({ ...valid, price: 'abc' })).not.toHaveLength(0);
    expect(messagesFor({ ...valid, price: 0.1 + 0.2 })).not.toHaveLength(0);
  });

  it('rejects a negative quantity', () => {
    expect(messagesFor({ ...valid, quantity: -1 })).toContain('Quantity cannot be negative.');
  });

  it('rejects a fractional quantity', () => {
    expect(messagesFor({ ...valid, quantity: 2.5 })).toContain('Quantity must be a whole number.');
  });

  it('rejects quantity sent as text', () => {
    expect(messagesFor({ ...valid, quantity: '5' })).toContain('Quantity must be a whole number.');
  });

  it('rejects malformed category and supplier identifiers', () => {
    const messages = messagesFor({ ...valid, categoryId: '123', supplierId: 'not-an-id' });
    expect(messages).toContain('Select a valid category.');
    expect(messages).toContain('Select a valid supplier.');
  });

  it('rejects SKUs with unsupported characters', () => {
    expect(messagesFor({ ...valid, sku: 'bad sku!' })).not.toHaveLength(0);
  });

  it('rejects over-long names', () => {
    expect(messagesFor({ ...valid, name: 'x'.repeat(121) })).toContain(
      'Product name must be 120 characters or fewer.',
    );
  });

  it('rejects protected or unknown fields (mass assignment)', () => {
    for (const extra of [{ _id: 'x' }, { createdAt: '2020-01-01' }, { priceCents: 1 }, { isAdmin: true }]) {
      expect(productInputSchema.safeParse({ ...valid, ...extra }).success).toBe(false);
    }
  });

  it('rejects non-object bodies', () => {
    expect(productInputSchema.safeParse(null).success).toBe(false);
    expect(productInputSchema.safeParse([]).success).toBe(false);
    expect(productInputSchema.safeParse('text').success).toBe(false);
  });
});
