import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from '../src/api/http';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('returns the parsed JSON body on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: [1, 2] })));
    await expect(apiRequest('/requests')).resolves.toEqual({ data: [1, 2] });
  });

  it('sends JSON bodies with the right method and header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('/requests', { method: 'POST', body: { a: 1 } });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/requests$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('returns undefined for 204 No Content without parsing a body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiRequest('/requests/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('maps 422 responses to an ApiError that carries field details', async () => {
    const body = { error: { code: 'VALIDATION_ERROR', message: 'bad', details: [{ field: 'title', message: 'Title is required' }] } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(422, body)));
    const error = (await apiRequest('/requests').catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.details).toEqual([{ field: 'title', message: 'Title is required' }]);
  });

  it('maps 404 and 5xx responses to friendly messages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'x' } })));
    const notFound = (await apiRequest('/x').catch((e: unknown) => e)) as ApiError;
    expect(notFound.message).toMatch(/no longer exists/i);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(500, { error: { code: 'INTERNAL_ERROR', message: 'stack trace here' } })));
    const serverError = (await apiRequest('/x').catch((e: unknown) => e)) as ApiError;
    expect(serverError.message).not.toMatch(/stack trace/);
  });

  it('does not assume error responses contain JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })));
    const error = (await apiRequest('/x').catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
  });

  it('reports network failures as NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = (await apiRequest('/x').catch((e: unknown) => e)) as ApiError;
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toMatch(/cannot reach the server/i);
  });
});
