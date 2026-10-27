import { Router } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';
import { serializeProduct, type ProductRecord, type ReferenceNames } from '../serializers';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError, type FieldDetail } from '../utils/httpError';
import { priceToCents } from '../utils/money';
import { isValidObjectId, productInputSchema } from '../validation/product';

export const productsRouter = Router();

async function loadReferenceNames(): Promise<ReferenceNames> {
  const [categories, suppliers] = await Promise.all([
    Category.find().select('name').lean(),
    Supplier.find().select('name').lean(),
  ]);
  return {
    categories: new Map(categories.map((c) => [c._id.toString(), c.name])),
    suppliers: new Map(suppliers.map((s) => [s._id.toString(), s.name])),
  };
}

function parseId(raw: string): string {
  if (!isValidObjectId(raw)) {
    throw new HttpError(400, 'INVALID_ID', 'The product identifier is not valid.');
  }
  return raw;
}

function productNotFound(): HttpError {
  return new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
}

/** MongoDB has no foreign keys, so the referenced documents are checked explicitly. */
async function assertReferencesExist(categoryId: string, supplierId: string): Promise<void> {
  const [category, supplier] = await Promise.all([
    Category.exists({ _id: categoryId }),
    Supplier.exists({ _id: supplierId }),
  ]);
  const details: FieldDetail[] = [];
  if (!category) details.push({ field: 'categoryId', message: 'The selected category does not exist.' });
  if (!supplier) details.push({ field: 'supplierId', message: 'The selected supplier does not exist.' });
  if (details.length > 0) {
    throw new HttpError(
      400,
      'INVALID_REFERENCE',
      'The product refers to a category or supplier that does not exist.',
      details,
    );
  }
}

productsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [products, refs] = await Promise.all([
      Product.find().sort({ createdAt: -1, _id: -1 }).lean(),
      loadReferenceNames(),
    ]);
    res.json({ data: products.map((p) => serializeProduct(p as unknown as ProductRecord, refs)) });
  }),
);

productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const [product, refs] = await Promise.all([Product.findById(id).lean(), loadReferenceNames()]);
    if (!product) throw productNotFound();
    res.json({ data: serializeProduct(product as unknown as ProductRecord, refs) });
  }),
);

productsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = productInputSchema.parse(req.body);
    await assertReferencesExist(input.categoryId, input.supplierId);

    // Only allowlisted, validated fields are written. Duplicate SKUs are rejected by the
    // unique index and surface as a 409 through the error handler.
    const created = await Product.create({
      name: input.name,
      sku: input.sku,
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      priceCents: priceToCents(input.price),
      quantity: input.quantity,
    });

    const refs = await loadReferenceNames();
    res.status(201).json({ data: serializeProduct(created.toObject() as unknown as ProductRecord, refs) });
  }),
);

productsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const input = productInputSchema.parse(req.body);
    await assertReferencesExist(input.categoryId, input.supplierId);

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: input.name,
          sku: input.sku,
          categoryId: input.categoryId,
          supplierId: input.supplierId,
          priceCents: priceToCents(input.price),
          quantity: input.quantity,
        },
      },
      { new: true, runValidators: true },
    ).lean();
    if (!updated) throw productNotFound();

    const refs = await loadReferenceNames();
    res.json({ data: serializeProduct(updated as unknown as ProductRecord, refs) });
  }),
);

productsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) throw productNotFound();
    res.status(204).send();
  }),
);
