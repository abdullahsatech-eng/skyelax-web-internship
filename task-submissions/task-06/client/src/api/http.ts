const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/+$/,
  '',
);

export interface FieldError {
  field: string;
  message: string;
}

/** Any failure from the API layer, with a message that is safe to show to users. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toApiError(status: number, payload: unknown): ApiError {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  const code = typeof error?.code === 'string' ? error.code : 'UNKNOWN_ERROR';
  const details: FieldError[] = Array.isArray(error?.details)
    ? (error.details as unknown[]).filter(
        (item): item is FieldError =>
          isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string',
      )
    : [];

  if (status === 422) {
    return new ApiError('Some fields need attention. Please review the form.', status, code, details);
  }
  if (status === 404) {
    return new ApiError('This request no longer exists. It may have been deleted.', status, code);
  }
  if (status === 503) {
    return new ApiError(
      'The service is temporarily unavailable. Please try again in a moment.',
      status,
      code,
    );
  }
  if (status >= 500) {
    return new ApiError('The server ran into a problem. Please try again.', status, code);
  }
  const message =
    typeof error?.message === 'string' ? error.message : 'The request could not be completed.';
  return new ApiError(message, status, code, details);
}

/** Sends a request to the API and returns the parsed JSON body (undefined for 204). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      'Cannot reach the server. Check your connection and try again.',
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined; // The body may be empty or not JSON (for example a proxy error page).
  }

  if (!response.ok) throw toApiError(response.status, payload);
  if (payload === undefined) {
    throw new ApiError('The server sent a response the app could not read.', response.status, 'INVALID_RESPONSE');
  }
  return payload as T;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
