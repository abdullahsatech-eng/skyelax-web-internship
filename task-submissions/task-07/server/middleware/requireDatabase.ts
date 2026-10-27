import type { RequestHandler } from 'express';
import { isDatabaseConnected } from '../db/connection';
import { HttpError } from '../utils/httpError';

/** Fails fast with 503 instead of letting a request hang when MongoDB is unreachable. */
export const requireDatabase: RequestHandler = (_req, _res, next) => {
  if (!isDatabaseConnected()) {
    next(
      new HttpError(503, 'DATABASE_UNAVAILABLE', 'The database is not reachable right now. Please try again shortly.'),
    );
    return;
  }
  next();
};
