import type { ZodError, ZodTypeAny, z } from 'zod';
import { AppError, type FieldError } from '../errors/appError';

export function toFieldErrors(error: ZodError): FieldError[] {
  const seen = new Set<string>();
  const result: FieldError[] = [];

  for (const issue of error.issues) {
    let field = issue.path.join('.');
    let message = issue.message;

    if (issue.code === 'unrecognized_keys') {
      field = issue.keys.join(', ');
      message = `Unsupported field(s): ${issue.keys.join(', ')}`;
    } else if (field === '' && issue.code === 'invalid_type') {
      field = '(body)';
      message = 'Request body must be a JSON object';
    }

    // Keep only the first message per field so the client gets one clear problem each.
    if (seen.has(field)) continue;
    seen.add(field);
    result.push({ field, message });
  }
  return result;
}

/** Parses data with a Zod schema or throws a 422 AppError with field-level details. */
export function parseWith<S extends ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw AppError.validation(toFieldErrors(result.error));
  return result.data;
}
