import { z } from 'zod';
import { CATEGORIES, PRIORITIES, STATUSES } from '../types/serviceRequest';

function text(label: string, min: number, max: number) {
  return z
    .string({
      required_error: `${label} is required`,
      invalid_type_error: `${label} must be text`,
    })
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);
}

/** Error messages for enum fields: "is required" when missing, otherwise the allowed values. */
function enumErrors(label: string, values: readonly string[]): z.ZodErrorMap {
  return (issue, ctx) =>
    issue.code === 'invalid_type' && ctx.data === undefined
      ? { message: `${label} is required` }
      : { message: `${label} must be one of: ${values.join(', ')}` };
}

const email = z
  .string({
    required_error: 'Requester email is required',
    invalid_type_error: 'Requester email must be text',
  })
  .trim()
  .min(1, 'Requester email is required')
  .max(254, 'Requester email must be at most 254 characters')
  .email('Requester email must be a valid email address')
  .toLowerCase();

const baseFields = {
  title: text('Title', 5, 100),
  description: text('Description', 10, 1000),
  category: z.enum(CATEGORIES, { errorMap: enumErrors('Category', CATEGORIES) }),
  requesterName: text('Requester name', 2, 80),
  requesterEmail: email,
};

/** POST body: priority and status are optional and get defaults. */
export const createRequestSchema = z
  .object({
    ...baseFields,
    priority: z.enum(PRIORITIES, { errorMap: enumErrors('Priority', PRIORITIES) }).default('medium'),
    status: z.enum(STATUSES, { errorMap: enumErrors('Status', STATUSES) }).default('open'),
  })
  .strict();

/** PUT body: the complete set of editable fields is required. */
export const replaceRequestSchema = z
  .object({
    ...baseFields,
    priority: z.enum(PRIORITIES, { errorMap: enumErrors('Priority', PRIORITIES) }),
    status: z.enum(STATUSES, { errorMap: enumErrors('Status', STATUSES) }),
  })
  .strict();

export const listQuerySchema = z.object({
  search: z.string().trim().max(100, 'Search must be at most 100 characters').optional(),
  status: z.enum(STATUSES, { errorMap: enumErrors('Status', STATUSES) }).optional(),
  priority: z.enum(PRIORITIES, { errorMap: enumErrors('Priority', PRIORITIES) }).optional(),
  category: z.enum(CATEGORIES, { errorMap: enumErrors('Category', CATEGORIES) }).optional(),
  page: z.coerce.number().int('Page must be a whole number').min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit must be at most 50')
    .default(10),
});
