import path from 'node:path';
import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/db/connection';
import { Category } from '../src/models/Category';
import { Product } from '../src/models/Product';
import { Supplier } from '../src/models/Supplier';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * REAL database integration tests (MongoDB Atlas).
 * They only run when TEST_MONGODB_URI is set, and they refuse to run unless the database
 * name ends in "_test", because they delete every document in that database's collections.
 * A plain readWrite database user is enough; no dropDatabase privilege is needed.
 */
const uri = process.env.TEST_MONGODB_URI?.trim();
const dbName = process.env.TEST_MONGODB_DATABASE?.trim() || 'stockdesk_test';
const enabled = Boolean(uri) && !/your_mongodb/i.test(uri ?? '') && dbName.endsWith('_test');

async function clearAll(): Promise<void> {
  await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Supplier.deleteMany({})]);
}

describe.skipIf(!enabled)('Products API against a real MongoDB database', () => {
  const app = createApp();
  let categoryId = '';
  let supplierId = '';

  const body = (overrides: Record<string, unknown> = {}) => ({
    name: 'Desk Lamp',
    sku: 'LAMP-001',
    categoryId,
    supplierId,
    price: '24.50',
    quantity: 12,
    ...overrides,
  });

  beforeAll(async () => {
    await connectDatabase(uri as string, dbName);
    await clearAll(); // safe: database name verified to end with "_test"
    // Make sure the unique indexes exist (createIndexes is idempotent).
    await Promise.all([Category.createIndexes(), Supplier.createIndexes(), Product.createIndexes()]);
    const category = await Category.create({ name: 'Test Category' });
    const supplier = await Supplier.create({ name: 'Test Supplier', email: 'test@supplier.example' });
    categoryId = category._id.toString();
    supplierId = supplier._id.toString();
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await clearAll();
    await disconnectDatabase();
  });

  it('reports a connected database', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.database).toBe('connected');
  });

  it('retrieves reference data', async () => {
    const categories = await request(app).get('/api/categories');
    const suppliers = await request(app).get('/api/suppliers');
    expect(categories.status).toBe(200);
    expect(categories.body.data[0]).toMatchObject({ id: categoryId, name: 'Test Category' });
    expect(suppliers.status).toBe(200);
    expect(suppliers.body.data[0]).toMatchObject({ id: supplierId, name: 'Test Supplier' });
  });

  it('creates a product and persists it (201, then re-read)', async () => {
    const created = await request(app).post('/api/products').send(body());
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      name: 'Desk Lamp',
      sku: 'LAMP-001',
      price: '24.50',
      quantity: 12,
      category: { id: categoryId, name: 'Test Category' },
      supplier: { id: supplierId, name: 'Test Supplier' },
    });
    expect(await Product.countDocuments({ sku: 'LAMP-001' })).toBe(1);

    const list = await request(app).get('/api/products');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
  });

  it('retrieves a single product', async () => {
    const created = await request(app).post('/api/products').send(body());
    const res = await request(app).get(`/api/products/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.sku).toBe('LAMP-001');
  });

  it('updates a product, persists the change and refreshes updatedAt', async () => {
    const created = await request(app).post('/api/products').send(body());
    const id = created.body.data.id as string;
    await new Promise((resolve) => setTimeout(resolve, 20));

    const updated = await request(app).put(`/api/products/${id}`).send(body({ quantity: 3, price: '30' }));
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ quantity: 3, price: '30.00' });
    expect(new Date(updated.body.data.updatedAt).getTime()).toBeGreaterThan(
      new Date(created.body.data.updatedAt).getTime(),
    );
    expect(updated.body.data.createdAt).toBe(created.body.data.createdAt);

    const reread = await request(app).get(`/api/products/${id}`);
    expect(reread.body.data).toMatchObject({ quantity: 3, price: '30.00' });
  });

  it('deletes a product (204) and it stays absent', async () => {
    const created = await request(app).post('/api/products').send(body());
    const id = created.body.data.id as string;

    const del = await request(app).delete(`/api/products/${id}`);
    expect(del.status).toBe(204);
    expect((await request(app).get(`/api/products/${id}`)).status).toBe(404);
    expect(await Product.countDocuments({})).toBe(0);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const missing = '64b7f0c2a1b2c3d4e5f6aaaa';
    expect((await request(app).get(`/api/products/${missing}`)).status).toBe(404);
    expect((await request(app).put(`/api/products/${missing}`).send(body())).status).toBe(404);
    expect((await request(app).delete(`/api/products/${missing}`)).status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/products/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('rejects a duplicate SKU with 409, case-insensitively, via the unique index', async () => {
    await request(app).post('/api/products').send(body());
    const dup = await request(app).post('/api/products').send(body({ name: 'Other', sku: 'lamp-001' }));
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('DUPLICATE_VALUE');
    expect(await Product.countDocuments({})).toBe(1);
  });

  it('rejects updating a product to another product\'s SKU with 409', async () => {
    await request(app).post('/api/products').send(body());
    const second = await request(app).post('/api/products').send(body({ sku: 'LAMP-002' }));
    const res = await request(app).put(`/api/products/${second.body.data.id}`).send(body({ sku: 'LAMP-001' }));
    expect(res.status).toBe(409);
  });

  it.each([
    ['negative price', { price: '-1' }],
    ['negative quantity', { quantity: -1 }],
    ['fractional quantity', { quantity: 1.5 }],
    ['missing name', { name: '' }],
    ['protected field', { _id: '64b7f0c2a1b2c3d4e5f6aaaa' }],
  ])('rejects invalid data: %s (400, nothing stored)', async (_label, overrides) => {
    const res = await request(app).post('/api/products').send(body(overrides));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(await Product.countDocuments({})).toBe(0);
  });

  it('rejects a category or supplier that does not exist (400)', async () => {
    const ghost = '64b7f0c2a1b2c3d4e5f6bbbb';
    const badCategory = await request(app).post('/api/products').send(body({ categoryId: ghost }));
    expect(badCategory.status).toBe(400);
    expect(badCategory.body.error.code).toBe('INVALID_REFERENCE');
    expect(badCategory.body.error.details[0].field).toBe('categoryId');

    const badSupplier = await request(app).post('/api/products').send(body({ supplierId: ghost }));
    expect(badSupplier.status).toBe(400);
    expect(badSupplier.body.error.details[0].field).toBe('supplierId');
    expect(await Product.countDocuments({})).toBe(0);
  });
});

describe.skipIf(enabled)('Products API against a real MongoDB database', () => {
  it.skip('BLOCKED: set TEST_MONGODB_URI (and a *_test database name) to run the integration tests', () => undefined);
});
