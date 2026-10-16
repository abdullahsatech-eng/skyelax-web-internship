import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { NONEXISTENT_ID, buildTestApp, validPayload } from './helpers/testApp';

const ID_PATTERN = /^[0-9a-f]{24}$/;

async function createOne(app: ReturnType<typeof buildTestApp>, overrides: Record<string, unknown> = {}) {
  const response = await request(app)
    .post('/api/v1/requests')
    .send({ ...validPayload, ...overrides });
  expect(response.status).toBe(201);
  return response.body.data as { id: string; createdAt: string; updatedAt: string };
}

describe('POST /api/v1/requests', () => {
  it('creates a request, returns 201 with the resource and a Location header', async () => {
    const app = buildTestApp();
    const response = await request(app).post('/api/v1/requests').send(validPayload);

    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.headers.location).toBe(`/api/v1/requests/${response.body.data.id}`);
    expect(response.body.data).toMatchObject({
      title: validPayload.title,
      category: 'it',
      priority: 'high',
      status: 'open', // default
      requesterEmail: 'demo.requester@example.com', // normalised to lowercase
    });
    expect(response.body.data.id).toMatch(ID_PATTERN);
    expect(typeof response.body.data.createdAt).toBe('string');
    expect(typeof response.body.data.updatedAt).toBe('string');
  });

  it('applies the default priority "medium" when none is supplied', async () => {
    const app = buildTestApp();
    const { priority: _omitted, ...withoutPriority } = validPayload;
    const response = await request(app).post('/api/v1/requests').send(withoutPriority);
    expect(response.status).toBe(201);
    expect(response.body.data.priority).toBe('medium');
  });

  it('trims string fields before storing them', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .post('/api/v1/requests')
      .send({ ...validPayload, title: '   Padded title   ' });
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Padded title');
  });

  const longText = (length: number) => 'x'.repeat(length);
  const invalidCases: Array<[string, Record<string, unknown>, string]> = [
    ['missing title', { title: undefined }, 'title'],
    ['whitespace-only title', { title: '     ' }, 'title'],
    ['title shorter than 5 characters', { title: 'abc' }, 'title'],
    ['title longer than 100 characters', { title: longText(101) }, 'title'],
    ['description shorter than 10 characters', { description: 'too short' }, 'description'],
    ['description longer than 1000 characters', { description: longText(1001) }, 'description'],
    ['requester name shorter than 2 characters', { requesterName: 'A' }, 'requesterName'],
    ['requester name longer than 80 characters', { requesterName: longText(81) }, 'requesterName'],
    ['missing requester email', { requesterEmail: undefined }, 'requesterEmail'],
    ['invalid email address', { requesterEmail: 'not-an-email' }, 'requesterEmail'],
    ['unsupported category', { category: 'finance' }, 'category'],
    ['missing category', { category: undefined }, 'category'],
    ['unsupported priority', { priority: 'critical' }, 'priority'],
    ['unsupported status', { status: 'done' }, 'status'],
    ['client-supplied id', { id: 'abc' }, 'id'],
    ['client-supplied createdAt', { createdAt: '2020-01-01T00:00:00.000Z' }, 'createdAt'],
  ];

  it.each(invalidCases)('rejects %s with 422 and field details', async (_name, overrides, field) => {
    const app = buildTestApp();
    const response = await request(app)
      .post('/api/v1/requests')
      .send({ ...validPayload, ...overrides });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(typeof response.body.error.message).toBe('string');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, message: expect.any(String) })]),
    );
    expect(response.body.data).toBeUndefined();
  });

  it('returns details for every invalid field at once', async () => {
    const app = buildTestApp();
    const response = await request(app).post('/api/v1/requests').send({});
    expect(response.status).toBe(422);
    const fields = response.body.error.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(
      expect.arrayContaining(['title', 'description', 'category', 'requesterName', 'requesterEmail']),
    );
  });

  it('rejects a JSON body that is not an object with 422', async () => {
    const app = buildTestApp();
    const response = await request(app).post('/api/v1/requests').send([1, 2, 3]);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a request with no body with 422', async () => {
    const app = buildTestApp();
    const response = await request(app).post('/api/v1/requests');
    expect(response.status).toBe(422);
  });

  it('rejects malformed JSON with 400 MALFORMED_JSON', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .post('/api/v1/requests')
      .set('Content-Type', 'application/json')
      .send('{"title":');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('MALFORMED_JSON');
  });

  it('rejects an oversized body with 413', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .post('/api/v1/requests')
      .send({ ...validPayload, description: 'x'.repeat(20_000) });
    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('GET /api/v1/requests', () => {
  it('returns an empty array and zeroed meta when nothing exists', async () => {
    const app = buildTestApp();
    const response = await request(app).get('/api/v1/requests');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      statusCounts: { open: 0, 'in-progress': 0, resolved: 0, closed: 0 },
    });
  });

  it('lists created requests, newest first', async () => {
    const app = buildTestApp();
    await createOne(app, { title: 'First request' });
    await createOne(app, { title: 'Second request' });

    const response = await request(app).get('/api/v1/requests');
    expect(response.status).toBe(200);
    expect(response.body.data.map((item: { title: string }) => item.title)).toEqual([
      'Second request',
      'First request',
    ]);
    expect(response.body.meta.total).toBe(2);
    expect(response.body.meta.statusCounts.open).toBe(2);
  });

  it('filters by status, priority, category and search text', async () => {
    const app = buildTestApp();
    await createOne(app, { title: 'Printer is jammed', category: 'it', priority: 'low' });
    await createOne(app, { title: 'Leaking tap', category: 'plumbing', priority: 'urgent', status: 'resolved' });
    await createOne(app, { title: 'Broken light', category: 'electrical', priority: 'urgent' });

    const byStatus = await request(app).get('/api/v1/requests?status=resolved');
    expect(byStatus.body.data).toHaveLength(1);
    expect(byStatus.body.data[0].title).toBe('Leaking tap');

    const byPriority = await request(app).get('/api/v1/requests?priority=urgent');
    expect(byPriority.body.data).toHaveLength(2);

    const byCategory = await request(app).get('/api/v1/requests?category=it');
    expect(byCategory.body.data).toHaveLength(1);

    const bySearch = await request(app).get('/api/v1/requests?search=LIGHT');
    expect(bySearch.body.data).toHaveLength(1);
    expect(bySearch.body.data[0].title).toBe('Broken light');

    const combined = await request(app).get('/api/v1/requests?priority=urgent&status=open');
    expect(combined.body.data).toHaveLength(1);

    // statusCounts describe the whole collection, not the filtered view.
    expect(byStatus.body.meta.statusCounts).toMatchObject({ open: 2, resolved: 1 });
  });

  it('returns an empty array when filters match nothing', async () => {
    const app = buildTestApp();
    await createOne(app);
    const response = await request(app).get('/api/v1/requests?search=nothing-matches-this');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta.total).toBe(0);
  });

  it('paginates with accurate metadata', async () => {
    const app = buildTestApp();
    for (let i = 1; i <= 5; i += 1) await createOne(app, { title: `Request number ${i}` });

    const page2 = await request(app).get('/api/v1/requests?page=2&limit=2');
    expect(page2.status).toBe(200);
    expect(page2.body.data).toHaveLength(2);
    expect(page2.body.meta).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });

    const beyondEnd = await request(app).get('/api/v1/requests?page=9&limit=2');
    expect(beyondEnd.body.data).toEqual([]);
  });

  const invalidQueries = ['status=bogus', 'priority=critical', 'category=finance', 'limit=0', 'limit=51', 'page=0', 'page=abc', 'limit=1.5'];
  it.each(invalidQueries)('rejects invalid query "%s" with 422', async (query) => {
    const app = buildTestApp();
    const response = await request(app).get(`/api/v1/requests?${query}`);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/requests/:id', () => {
  it('returns one request', async () => {
    const app = buildTestApp();
    const created = await createOne(app);
    const response = await request(app).get(`/api/v1/requests/${created.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(created.id);
    expect(response.body.data.title).toBe(validPayload.title);
  });

  it('returns 404 NOT_FOUND for a valid but unknown id', async () => {
    const app = buildTestApp();
    const response = await request(app).get(`/api/v1/requests/${NONEXISTENT_ID}`);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it.each(['abc', '123', 'zzzzzzzzzzzzzzzzzzzzzzzz', '12345678901234567890123'])(
    'returns 400 INVALID_ID for malformed id "%s"',
    async (id) => {
      const app = buildTestApp();
      const response = await request(app).get(`/api/v1/requests/${id}`);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_ID');
    },
  );
});

describe('PUT /api/v1/requests/:id', () => {
  const fullUpdate = {
    title: 'Projector replaced',
    description: 'Facilities swapped the projector for a spare unit.',
    category: 'maintenance',
    priority: 'low',
    status: 'resolved',
    requesterName: 'Demo Requester',
    requesterEmail: 'demo.requester@example.com',
  };

  it('replaces the editable fields, returns 200 and bumps updatedAt', async () => {
    const app = buildTestApp();
    const created = await createOne(app);

    const response = await request(app).put(`/api/v1/requests/${created.id}`).send(fullUpdate);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ ...fullUpdate, id: created.id });
    expect(response.body.data.createdAt).toBe(created.createdAt);
    expect(response.body.data.updatedAt).not.toBe(created.updatedAt);

    const reread = await request(app).get(`/api/v1/requests/${created.id}`);
    expect(reread.body.data.status).toBe('resolved');
  });

  it('rejects an incomplete payload with 422 (PUT needs every editable field)', async () => {
    const app = buildTestApp();
    const created = await createOne(app);
    const { priority: _omitted, ...incomplete } = fullUpdate;
    const response = await request(app).put(`/api/v1/requests/${created.id}`).send(incomplete);
    expect(response.status).toBe(422);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'priority' })]),
    );
  });

  it.each([
    ['id', { id: NONEXISTENT_ID }],
    ['createdAt', { createdAt: '2020-01-01T00:00:00.000Z' }],
    ['updatedAt', { updatedAt: '2020-01-01T00:00:00.000Z' }],
  ])('rejects attempts to set server-managed field "%s"', async (field, extra) => {
    const app = buildTestApp();
    const created = await createOne(app);
    const response = await request(app)
      .put(`/api/v1/requests/${created.id}`)
      .send({ ...fullUpdate, ...extra });
    expect(response.status).toBe(422);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });

  it('rejects invalid values with 422', async () => {
    const app = buildTestApp();
    const created = await createOne(app);
    const response = await request(app)
      .put(`/api/v1/requests/${created.id}`)
      .send({ ...fullUpdate, status: 'archived', requesterEmail: 'nope' });
    expect(response.status).toBe(422);
    const fields = response.body.error.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(['status', 'requesterEmail']));
  });

  it('returns 404 for a valid but unknown id', async () => {
    const app = buildTestApp();
    const response = await request(app).put(`/api/v1/requests/${NONEXISTENT_ID}`).send(fullUpdate);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a malformed id', async () => {
    const app = buildTestApp();
    const response = await request(app).put('/api/v1/requests/not-an-id').send(fullUpdate);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });
});

describe('DELETE /api/v1/requests/:id', () => {
  it('deletes a request, returns 204 with no body, and the resource is then gone', async () => {
    const app = buildTestApp();
    const created = await createOne(app);

    const response = await request(app).delete(`/api/v1/requests/${created.id}`);
    expect(response.status).toBe(204);
    expect(response.text).toBe('');

    const reread = await request(app).get(`/api/v1/requests/${created.id}`);
    expect(reread.status).toBe(404);

    const again = await request(app).delete(`/api/v1/requests/${created.id}`);
    expect(again.status).toBe(404);
    expect(again.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 for a valid but unknown id', async () => {
    const app = buildTestApp();
    const response = await request(app).delete(`/api/v1/requests/${NONEXISTENT_ID}`);
    expect(response.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const app = buildTestApp();
    const response = await request(app).delete('/api/v1/requests/xyz');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });
});
