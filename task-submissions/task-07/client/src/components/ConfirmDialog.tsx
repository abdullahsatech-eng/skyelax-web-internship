import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  productName: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ productName, busy, error, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel]);

  return (
    <div className="dialog-backdrop">
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <h2 id="confirm-title">Delete this product?</h2>
        <p id="confirm-description">
          <strong>{productName}</strong> will be permanently removed from the inventory. This cannot be undone.
        </p>
        {error && (
          <p className="field-error" role="alert">
            Error: {error}
          </p>
        )}
        <div className="actions">
          <button type="button" className="btn" ref={cancelRef} onClick={onCancel} disabled={busy}>
            Keep product
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete product'}
          </button>
        </div>
      </div>
    </div>
  );
}
