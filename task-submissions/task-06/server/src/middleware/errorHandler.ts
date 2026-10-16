import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError, type FieldError } from '../errors/appError';
import { toFieldErrors } from '../validators/validate';

interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  details?: FieldError[];
}

const DATABASE_UNAVAILABLE_ERRORS = new Set([
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongooseServerSelectionError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
]);

/** body-parser (express.json) errors carry a numeric `status` and a string `type`. */
function isBodyParserError(error: unknown): error is { status: number; type: string } {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { status?: unknown; type?: unknown };
  return typeof candidate.status === 'number' && typeof candidate.type === 'string';
}

function toApiError(error: unknown): ApiErrorBody {
  if (error instanceof AppError) {
    return { status: error.status, code: error.code, message: error.message, details: error.details };
  }
  if (error instanceof ZodError) {
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'The submitted data is not valid.',
      details: toFieldErrors(error),
    };
  }
  if (isBodyParserError(error)) {
    if (error.type === 'entity.parse.failed') {
      return { status: 400, code: 'MALFORMED_JSON', message: 'The request body is not valid JSON.' };
    }
    if (error.type === 'entity.too.large') {
      return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' };
    }
    return { status: 400, code: 'BAD_REQUEST', message: 'The request could not be processed.' };
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'The submitted data is not valid.',
      details: Object.values(error.errors).map((item) => ({ field: item.path, message: item.message })),
    };
  }
  if (error instanceof mongoose.Error.CastError) {
    return { status: 400, code: 'BAD_REQUEST', message: 'A value in the request has the wrong format.' };
  }
  if (
    error instanceof Error &&
    (DATABASE_UNAVAILABLE_ERRORS.has(error.name) || error.message.includes('buffering timed out'))
  ) {
    return {
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    };
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' };
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'The requested route does not exist.' },
  });
};

export function createErrorHandler(options: { logErrors: boolean }): ErrorRequestHandler {
  // Express identifies error handlers by their four parameters, so `_next` must stay.
  return (error, req, res, next) => {
    const apiError = toApiError(error);

    if (options.logErrors && apiError.status >= 500) {
      // Server-side only; request bodies are deliberately not logged.
      console.error(
        `[error] ${req.method} ${req.path} -> ${apiError.status}`,
        error instanceof Error ? (error.stack ?? error.message) : error,
      );
    }
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(apiError.status).json({
      error: {
        code: apiError.code,
        message: apiError.message,
        ...(apiError.details ? { details: apiError.details } : {}),
      },
    });
  };
}
