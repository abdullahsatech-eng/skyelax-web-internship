import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface CommonProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids: string[] = [];
  if (hint) ids.push(`${id}-hint`);
  if (error) ids.push(`${id}-error`);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldShell({ id, label, required, hint, error, children }: CommonProps & { children: ReactNode }) {
  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? <span className="field__flag"> (required)</span> : null}
      </label>
      {hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends CommonProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date';
  inputMode?: 'text' | 'decimal' | 'numeric';
  autoComplete?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

export function TextField({ id, label, required, hint, error, value, onChange, type = 'text', inputMode, autoComplete, placeholder, min, max }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        className="input"
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-required={required ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends CommonProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextAreaField({ id, label, required, hint, error, value, onChange, rows = 4, placeholder }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={id}
        className="input input--area"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-required={required ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends CommonProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function SelectField({ id, label, required, hint, error, value, onChange, options, disabled, placeholder }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        id={id}
        className="input input--select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-required={required ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Search box used above lists. The label is visible, so it is easy to recognise rather than remember. */
export function SearchField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="field field--search">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="search-box">
        <Icon name="search" size={18} className="search-box__icon" />
        <input
          id={id}
          className="input input--search"
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
