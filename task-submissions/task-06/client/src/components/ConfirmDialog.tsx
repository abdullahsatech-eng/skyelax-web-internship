import { useRef, useState, type ReactNode } from 'react';
import { messageFromError } from '../utils/errors';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busyLabel: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/** Destructive-action confirmation. Nothing happens until the user presses the confirm button. */
export function ConfirmDialog({ title, children, confirmLabel, busyLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  async function handleConfirm() {
    if (busyRef.current) return; // ignore double clicks
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (caught) {
      setError(messageFromError(caught));
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel} closeDisabled={busy} size="compact">
      <div className="stack">
        <div>{children}</div>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy} aria-busy={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
