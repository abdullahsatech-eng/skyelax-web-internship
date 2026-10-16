import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryRequestRepository, failingRepository } from './helpers/inMemoryRepository';
import { NONEXISTENT_ID, TEST_ORIGIN, buildTestApp, validPayload } from './helpers/testApp';

describe('unknown routes', () => {
  it.each([
    ['GET', '/api/v1/unknown'],
    ['GET', '/nothing-here'],
    ['PATCH', `/api/v1/requests/${NONEXISTENT_ID}`],
    ['POST', `/api/v1/requests/${NONEXISTENT_ID}`],
  ])('%s %s returns a JSON 404 ROUTE_NOT_FOUND', async (method, path) => {
    const app = buildTestApp();
    const response = await request(app)[method.toLowerCase() as 'get' | 'post' | 'patch'](path);
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

describe('unexpected failures', () => {
  it('returns 500 INTERNAL_ERROR without leaking internals', async () => {
    const app = buildTestApp({ repository: failingRepository(new Error('boom: secret detail')) });
    const response = await request(app).get('/api/v1/requests');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toMatch(/boom|secret|stack|at .*\.ts/i);
  });

  it('returns 503 SERVICE_UNAVAILABLE when the database cannot be reached', async () => {
    const error = new Error('connect ECONNREFUSED 10.0.0.1:27017');
    error.name = 'MongoServerSelectionError';
    const app = buildTestApp({ repository: failingRepository(error) });
    const response = await request(app).post('/api/v1/requests').send(validPayload);
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(JSON.stringify(response.body)).not.toContain('10.0.0.1');
  });

  it('keeps every error response in the { error: { code, message } } shape', async () => {
    const app = buildTestApp();
    const responses = await Promise.all([
      request(app).get('/api/v1/requests/bad'),
      request(app).get(`/api/v1/requests/${NONEXISTENT_ID}`),
      request(app).post('/api/v1/requests').send({}),
      request(app).get('/api/v1/nope'),
    ]);
    for (const response of responses) {
      expect(response.body.error).toEqual(
        expect.objectContaining({ code: expect.any(String), message: expect.any(String) }),
      );
    }
  });
});

describe('GET /api/v1/health', () => {
  it('returns 200 when the database is up', async () => {
    const response = await request(buildTestApp({ databaseUp: true })).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('returns 503 when the database check reports down', async () => {
    const response = await request(buildTestApp({ databaseUp: false })).get('/api/v1/health');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('returns 503 when the database check throws, without exposing the error', async () => {
    const app = buildTestApp({
      databaseUp: async () => {
        throw new Error('mongodb://user:password@host/db failed');
      },
    });
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain('password');
  });
});

describe('CORS', () => {
  it('allows the configured origin', async () => {
    const response = await request(buildTestApp())
      .get('/api/v1/requests')
      .set('Origin', TEST_ORIGIN);
    expect(response.headers['access-control-allow-origin']).toBe(TEST_ORIGIN);
  });

  it('does not grant access to other origins', async () => {
    const response = await request(buildTestApp())
      .get('/api/v1/requests')
      .set('Origin', 'https://evil.example');
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers preflight requests for PUT and DELETE', async () => {
    const response = await request(buildTestApp())
      .options('/api/v1/requests/abc')
      .set('Origin', TEST_ORIGIN)
      .set('Access-Control-Request-Method', 'PUT');
    expect(response.status).toBeLessThan(300);
    expect(response.headers['access-control-allow-methods']).toMatch(/PUT/);
  });
});

describe('sanity', () => {
  it('uses isolated in-memory state per app instance', async () => {
    const first = buildTestApp({ repository: new InMemoryRequestRepository() });
    const second = buildTestApp({ repository: new InMemoryRequestRepository() });
    await request(first).post('/api/v1/requests').send(validPayload);
    const response = await request(second).get('/api/v1/requests');
    expect(response.body.data).toEqual([]);
  });
});
