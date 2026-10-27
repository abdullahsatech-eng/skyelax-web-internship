import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { redactSecrets } from '../db/connection';
import { HttpError, type FieldDetail } from '../utils/httpError';

interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  details?: FieldDetail[];
}

const DATABASE_UNAVAILABLE_ERRORS = new Set([
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongooseServerSelectionError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
  'MongoPoolClearedError',
]);

const DUPLICATE_MESSAGES: Record<string, string> = {
  sku: 'A product with this SKU already exists.',
  name: 'A record with this name already exists.',
};

function fromZodError(error: ZodError): FieldDetail[] {
  const details: FieldDetail[] = [];
  for (const issue of error.issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) details.push({ field: key, message: 'This field cannot be set.' });
    } else {
      details.push({ field: issue.path.join('.') || 'body', message: issue.message });
    }
  }
  return details;
}

/** Translates any thrown value into a safe, consistent API error. */
export function toApiError(err: unknown): ApiErrorBody {
  if (err instanceof HttpError) {
    return { status: err.status, code: err.code, message: err.message, details: err.details };
  }
  if (err instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Some fields are invalid. Fix them and try again.',
      details: fromZodError(err),
    };
  }

  const e = (err ?? {}) as { name?: string; code?: unknown; type?: string; keyPattern?: Record<string, unknown> };

  if (e.type === 'entity.parse.failed') {
    return { status: 400, code: 'MALFORMED_JSON', message: 'The request body is not valid JSON.' };
  }
  if (e.type === 'entity.too.large') {
    return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' };
  }
  if (e.name === 'CastError') {
    return { status: 400, code: 'INVALID_ID', message: 'The identifier is not valid.' };
  }
  if (e.name === 'ValidationError') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'The data failed database validation.' };
  }
  if (e.code === 11000) {
    const field = Object.keys(e.keyPattern ?? {})[0] ?? 'value';
    const message = DUPLICATE_MESSAGES[field] ?? 'A record with this value already exists.';
    return { status: 409, code: 'DUPLICATE_VALUE', message, details: [{ field, message }] };
  }
  if (e.name && DATABASE_UNAVAILABLE_ERRORS.has(e.name)) {
    return {
      status: 503,
      code: 'DATABASE_UNAVAILABLE',
      message: 'The database is not reachable right now. Please try again shortly.',
    };
  }

  return { status: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' };
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'This endpoint does not exist.' } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const apiError = toApiError(err);

  if (apiError.status >= 500) {
    // Full diagnostics stay in the server log; clients only get the safe message below.
    const text = err instanceof Error ? (err.stack ?? err.message) : String(err);
    console.error('[stockdesk]', apiError.code, redactSecrets(text));
  }

  const { status, ...body } = apiError;
  res.status(status).json({ error: body });
};
