import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { errorHandler } from '../src/middleware/errorHandler';
import { HttpError } from '../src/utils/httpError';

// These tests need no database. They exercise the app while MongoDB is NOT connected
// (which is also how database unavailability is simulated) and the error translation layer.

describe('API while the database is unavailable', () => {
  const app = createApp();

  it('reports health without touching the database', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'disconnected' });
  });

  it.each(['/api/products', '/api/products/64b7f0c2a1b2c3d4e5f60718', '/api/categories', '/api/suppliers'])(
    'GET %s returns a safe 503',
    async (path) => {
      const res = await request(app).get(path);
      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
      expect(JSON.stringify(res.body)).not.toMatch(/mongodb|stack/i);
    },
  );

  it('returns 503 for writes too, never a success', async () => {
    const res = await request(app).post('/api/products').send({ name: 'x' });
    expect(res.status).toBe(503);
  });

  it('returns 400 for malformed JSON before reaching the database', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MALFORMED_JSON');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

describe('errorHandler translation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function appThrowing(error: unknown) {
    const app = express();
    app.get('/boom', () => {
      throw error;
    });
    app.use(errorHandler);
    return app;
  }

  it('maps HttpError to its status, code and details', async () => {
    const res = await request(
      appThrowing(new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found.')),
    ).get('/boom');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } });
  });

  it('maps a duplicate-key error on sku to 409', async () => {
    const res = await request(appThrowing({ code: 11000, keyPattern: { sku: 1 } })).get('/boom');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_VALUE');
    expect(res.body.error.details[0]).toEqual({ field: 'sku', message: 'A product with this SKU already exists.' });
  });

  it('maps a CastError to 400', async () => {
    const res = await request(appThrowing({ name: 'CastError' })).get('/boom');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('maps MongoDB connectivity errors to 503', async () => {
    const res = await request(appThrowing({ name: 'MongoServerSelectionError', message: 'mongodb://u:secret@host' })).get('/boom');
    expect(res.status).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });

  it('hides internals of unexpected errors and logs them server-side', async () => {
    const res = await request(
      appThrowing(new Error('connect to mongodb+srv://user:pass@cluster0.example.net failed')),
    ).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body.error).toEqual({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    expect(JSON.stringify(res.body)).not.toContain('pass');
    expect(console.error).toHaveBeenCalled();
    const logged = String(vi.mocked(console.error).mock.calls[0]?.[2]);
    expect(logged).not.toContain('user:pass');
  });
});
