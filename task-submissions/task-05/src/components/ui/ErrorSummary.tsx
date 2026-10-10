import { useEffect, useRef } from 'react';
import { pluralize } from '../../lib/text';
import type { FieldErrors } from '../../lib/validation';

/**
 * Lists every form problem at the top of the form. Focus moves here after a failed submit so keyboard
 * and screen-reader users hear what is wrong; each message jumps to the field it describes.
 * (Buttons are used instead of #links because the app uses hash routing.)
 */
export function ErrorSummary({ errors, attempt }: { errors: FieldErrors; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors);

  useEffect(() => {
    if (attempt > 0 && entries.length > 0) ref.current?.focus();
    // Only re-focus when a new submit attempt fails, not while the user is fixing fields.
  }, [attempt]);

  if (entries.length === 0) return null;

  return (
    <div ref={ref} className="error-summary" tabIndex={-1} role="group" aria-labelledby="error-summary-title">
      <h2 id="error-summary-title" className="error-summary__title">
        Fix {pluralize(entries.length, 'problem')} before saving
      </h2>
      <ul className="error-summary__list">
        {entries.map(([fieldId, message]) => (
          <li key={fieldId}>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                document.getElementById(fieldId)?.focus();
              }}
            >
              {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
