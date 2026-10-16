/**
 * Persistence-layer tests against a REAL MongoDB database.
 *
 * They only run when TEST_MONGODB_URI is set (for example to a free Atlas cluster
 * or a local mongod). They always use the dedicated database "fixflow_test",
 * whatever database name the URI contains, so application data is never touched.
 * Without TEST_MONGODB_URI the whole suite is reported as skipped, not passed.
 */
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { checkDatabase } from '../src/config/database';
import { ServiceRequestModel } from '../src/models/serviceRequestModel';
import { MongoRequestRepository } from '../src/services/mongoRequestRepository';
import { NONEXISTENT_ID, TEST_ORIGIN, validPayload } from './helpers/testApp';

const uri = process.env.TEST_MONGODB_URI;

describe.skipIf(!uri)('MongoRequestRepository against a real database', () => {
  const app = createApp({
    requestRepository: new MongoRequestRepository(),
    checkDatabase,
    corsOrigins: [TEST_ORIGIN],
    logErrors: false,
  });

  beforeAll(async () => {
    await mongoose.connect(uri as string, { dbName: 'fixflow_test', serverSelectionTimeoutMS: 10_000 });
    await ServiceRequestModel.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ServiceRequestModel.deleteMany({});
  });

  it('health endpoint reports the database as up', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
  });

  it('runs the full create, read, update, delete lifecycle and persists data', async () => {
    const created = await request(app).post('/api/v1/requests').send(validPayload);
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;

    // Verify directly in the database, bypassing the API.
    const stored = await ServiceRequestModel.findById(id).lean();
    expect(stored?.title).toBe(validPayload.title);
    expect(stored?.requesterEmail).toBe('demo.requester@example.com');

    const fetched = await request(app).get(`/api/v1/requests/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.id).toBe(id);

    const updated = await request(app)
      .put(`/api/v1/requests/${id}`)
      .send({ ...validPayload, status: 'in-progress', title: 'Projector under repair' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe('in-progress');
    expect(new Date(updated.body.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.body.data.updatedAt).getTime(),
    );

    const afterUpdate = await request(app).get(`/api/v1/requests/${id}`);
    expect(afterUpdate.body.data.title).toBe('Projector under repair');

    const deleted = await request(app).delete(`/api/v1/requests/${id}`);
    expect(deleted.status).toBe(204);
    expect(await ServiceRequestModel.countDocuments()).toBe(0);

    const missing = await request(app).get(`/api/v1/requests/${id}`);
    expect(missing.status).toBe(404);
  });

  it('filters, searches (with regex characters escaped) and paginates', async () => {
    await request(app).post('/api/v1/requests').send({ ...validPayload, title: 'Printer (floor 2) jammed' });
    await request(app).post('/api/v1/requests').send({ ...validPayload, title: 'Tap leaking', category: 'plumbing' });
    await request(app).post('/api/v1/requests').send({ ...validPayload, title: 'Light broken', status: 'resolved' });

    const search = await request(app).get('/api/v1/requests').query({ search: '(floor 2)' });
    expect(search.body.data).toHaveLength(1);

    const plumbing = await request(app).get('/api/v1/requests?category=plumbing');
    expect(plumbing.body.data).toHaveLength(1);

    const resolved = await request(app).get('/api/v1/requests?status=resolved');
    expect(resolved.body.meta.statusCounts).toMatchObject({ open: 2, resolved: 1 });

    const page = await request(app).get('/api/v1/requests?page=2&limit=2');
    expect(page.body.data).toHaveLength(1);
    expect(page.body.meta).toMatchObject({ total: 3, totalPages: 2 });
  });

  it('returns 404 for unknown ids', async () => {
    expect((await request(app).get(`/api/v1/requests/${NONEXISTENT_ID}`)).status).toBe(404);
    expect((await request(app).delete(`/api/v1/requests/${NONEXISTENT_ID}`)).status).toBe(404);
  });
});
