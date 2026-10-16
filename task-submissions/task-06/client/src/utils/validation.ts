import type { RequestFormValues } from '../types/serviceRequest';

export type FormErrors = Partial<Record<keyof RequestFormValues, string>>;

export const FIELD_ORDER: Array<keyof RequestFormValues> = [
  'title',
  'description',
  'category',
  'priority',
  'status',
  'requesterName',
  'requesterEmail',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkText(label: string, value: string, min: number, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${label} is required`;
  if (trimmed.length < min) return `${label} must be at least ${min} characters`;
  if (trimmed.length > max) return `${label} must be at most ${max} characters`;
  return undefined;
}

/**
 * Mirrors the server rules so people get instant feedback.
 * The server remains the authority and validates everything again.
 */
export function validateRequestForm(values: RequestFormValues): FormErrors {
  const errors: FormErrors = {};

  const title = checkText('Title', values.title, 5, 100);
  if (title) errors.title = title;

  const description = checkText('Description', values.description, 10, 1000);
  if (description) errors.description = description;

  if (values.category === '') errors.category = 'Choose a category';

  const name = checkText('Requester name', values.requesterName, 2, 80);
  if (name) errors.requesterName = name;

  const email = values.requesterEmail.trim();
  if (email.length === 0) errors.requesterEmail = 'Requester email is required';
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.requesterEmail = 'Enter a valid email address';
  }
  return errors;
}
