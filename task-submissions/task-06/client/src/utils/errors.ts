import { ApiError } from '../api/http';

export function messageFromError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}
