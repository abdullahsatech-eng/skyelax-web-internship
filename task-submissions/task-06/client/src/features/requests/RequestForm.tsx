import { useId, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/http';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Category,
  type Priority,
  type RequestFormValues,
  type RequestPayload,
  type Status,
} from '../../types/serviceRequest';
import { messageFromError } from '../../utils/errors';
import { FIELD_ORDER, validateRequestForm, type FormErrors } from '../../utils/validation';

interface RequestFormProps {
  mode: 'create' | 'edit';
  initialValues: RequestFormValues;
  onSubmit: (payload: RequestPayload) => Promise<void>;
  onCancel: () => void;
}

type FieldName = keyof RequestFormValues;

export function RequestForm({ mode, initialValues, onSubmit, onCancel }: RequestFormProps) {
  const uid = useId();
  const [values, setValues] = useState<RequestFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const fieldId = (name: FieldName) => `${uid}-${name}`;
  const errorId = (name: FieldName) => `${uid}-${name}-error`;

  function focusField(name: FieldName) {
    document.getElementById(fieldId(name))?.focus();
  }

  function setValue<K extends FieldName>(name: K, value: RequestFormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function controlProps(name: FieldName) {
    return {
      id: fieldId(name),
      name,
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? errorId(name) : undefined,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return; // protects against duplicate submissions

    const found = validateRequestForm(values);
    setErrors(found);
    setFormError(null);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category as Category,
        priority: values.priority,
        status: values.status,
        requesterName: values.requesterName.trim(),
        requesterEmail: values.requesterEmail.trim(),
      });
    } catch (caught) {
      // Input is kept as typed; the server's field messages are shown inline.
      if (caught instanceof ApiError && caught.details.length > 0) {
        const serverErrors: FormErrors = {};
        for (const detail of caught.details) {
          if ((FIELD_ORDER as string[]).includes(detail.field)) {
            serverErrors[detail.field as FieldName] = detail.message;
          }
        }
        setErrors(serverErrors);
        const first = FIELD_ORDER.find((name) => serverErrors[name]);
        if (first) focusField(first);
      }
      setFormError(messageFromError(caught));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p className="field-error" id={errorId(name)}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="muted">Fields marked * are required.</p>

      {formError && (
        <p className="alert alert-error" role="alert">
          {formError}
        </p>
      )}

      <div className="field">
        <label htmlFor={fieldId('title')}>
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          {...controlProps('title')}
          type="text"
          value={values.title}
          maxLength={150}
          required
          aria-required="true"
          data-autofocus
          onChange={(event) => setValue('title', event.target.value)}
        />
        {fieldError('title')}
      </div>

      <div className="field">
        <label htmlFor={fieldId('description')}>
          Description <span aria-hidden="true">*</span>
        </label>
        <textarea
          {...controlProps('description')}
          rows={4}
          value={values.description}
          required
          aria-required="true"
          onChange={(event) => setValue('description', event.target.value)}
        />
        <p className="hint">{values.description.trim().length} / 1000 characters</p>
        {fieldError('description')}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={fieldId('category')}>
            Category <span aria-hidden="true">*</span>
          </label>
          <select
            {...controlProps('category')}
            value={values.category}
            required
            aria-required="true"
            onChange={(event) => setValue('category', event.target.value as Category | '')}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {fieldError('category')}
        </div>

        <div className="field">
          <label htmlFor={fieldId('priority')}>Priority</label>
          <select
            {...controlProps('priority')}
            value={values.priority}
            onChange={(event) => setValue('priority', event.target.value as Priority)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
          {fieldError('priority')}
        </div>
      </div>

      {mode === 'edit' && (
        <div className="field">
          <label htmlFor={fieldId('status')}>Status</label>
          <select
            {...controlProps('status')}
            value={values.status}
            onChange={(event) => setValue('status', event.target.value as Status)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {fieldError('status')}
        </div>
      )}

      <div className="form-row">
        <div className="field">
          <label htmlFor={fieldId('requesterName')}>
            Requester name <span aria-hidden="true">*</span>
          </label>
          <input
            {...controlProps('requesterName')}
            type="text"
            autoComplete="name"
            value={values.requesterName}
            required
            aria-required="true"
            onChange={(event) => setValue('requesterName', event.target.value)}
          />
          {fieldError('requesterName')}
        </div>

        <div className="field">
          <label htmlFor={fieldId('requesterEmail')}>
            Requester email <span aria-hidden="true">*</span>
          </label>
          <input
            {...controlProps('requesterEmail')}
            type="email"
            autoComplete="email"
            value={values.requesterEmail}
            required
            aria-required="true"
            onChange={(event) => setValue('requesterEmail', event.target.value)}
          />
          {fieldError('requesterEmail')}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Saving...' : mode === 'create' ? 'Create request' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
