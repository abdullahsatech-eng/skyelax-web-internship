import { z } from 'zod';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
export const PRICE_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

/**
 * Create and update share one strict schema. `.strict()` rejects any field that is not
 * listed here (for example `_id`, `createdAt`, `priceCents`), which prevents mass assignment.
 */
export const productInputSchema = z
  .object({
    name: z
      .string({ required_error: 'Product name is required.', invalid_type_error: 'Product name must be text.' })
      .trim()
      .min(1, 'Product name is required.')
      .max(120, 'Product name must be 120 characters or fewer.'),
    sku: z
      .string({ required_error: 'SKU is required.', invalid_type_error: 'SKU must be text.' })
      .trim()
      .min(1, 'SKU is required.')
      .max(40, 'SKU must be 40 characters or fewer.')
      .regex(SKU_PATTERN, 'SKU may contain only letters, numbers, dots, hyphens and underscores.')
      .transform((sku) => sku.toUpperCase()),
    categoryId: z
      .string({ required_error: 'Category is required.', invalid_type_error: 'Category is invalid.' })
      .regex(OBJECT_ID, 'Select a valid category.'),
    supplierId: z
      .string({ required_error: 'Supplier is required.', invalid_type_error: 'Supplier is invalid.' })
      .regex(OBJECT_ID, 'Select a valid supplier.'),
    price: z
      .union([z.string(), z.number()], {
        errorMap: () => ({ message: 'Price is required and must be an amount such as 12.50.' }),
      })
      .transform((value) => String(value).trim())
      .pipe(
        z
          .string()
          .regex(
            PRICE_PATTERN,
            'Price must be zero or more, with at most 2 decimal places (maximum 9999999.99).',
          ),
      ),
    quantity: z
      .number({ required_error: 'Quantity is required.', invalid_type_error: 'Quantity must be a whole number.' })
      .int('Quantity must be a whole number.')
      .min(0, 'Quantity cannot be negative.')
      .max(1_000_000_000, 'Quantity is too large.'),
  })
  .strict();

export type ProductInput = z.infer<typeof productInputSchema>;

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}
