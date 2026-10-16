import { describe, expect, it } from 'vitest';
import { EMPTY_FORM_VALUES, type RequestFormValues } from '../src/types/serviceRequest';
import { validateRequestForm } from '../src/utils/validation';

const valid: RequestFormValues = {
  title: 'Broken door handle',
  description: 'The handle on the east door came off.',
  category: 'maintenance',
  priority: 'medium',
  status: 'open',
  requesterName: 'Demo Requester',
  requesterEmail: 'demo@example.com',
};

describe('validateRequestForm', () => {
  it('accepts valid values', () => {
    expect(validateRequestForm(valid)).toEqual({});
  });

  it('flags every required field on an empty form', () => {
    const errors = validateRequestForm(EMPTY_FORM_VALUES);
    expect(Object.keys(errors).sort()).toEqual(['category', 'description', 'requesterEmail', 'requesterName', 'title']);
  });

  it('measures length after trimming', () => {
    expect(validateRequestForm({ ...valid, title: '   ab   ' }).title).toMatch(/at least 5/);
    expect(validateRequestForm({ ...valid, title: '     ' }).title).toMatch(/required/);
  });

  it('enforces maximum lengths', () => {
    expect(validateRequestForm({ ...valid, title: 'x'.repeat(101) }).title).toMatch(/at most 100/);
    expect(validateRequestForm({ ...valid, description: 'x'.repeat(1001) }).description).toMatch(/at most 1000/);
    expect(validateRequestForm({ ...valid, requesterName: 'x'.repeat(81) }).requesterName).toMatch(/at most 80/);
  });

  it('rejects invalid email addresses', () => {
    expect(validateRequestForm({ ...valid, requesterEmail: 'nope' }).requesterEmail).toMatch(/valid email/);
    expect(validateRequestForm({ ...valid, requesterEmail: 'a@b' }).requesterEmail).toMatch(/valid email/);
  });
});
