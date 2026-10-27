export type NoticeKind = 'success' | 'error';

interface NoticeProps {
  kind: NoticeKind;
  children: string;
  onDismiss?: () => void;
}

/** Status message. The text prefix means meaning never depends on colour alone. */
export function Notice({ kind, children, onDismiss }: NoticeProps) {
  return (
    <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <p>
        <strong>{kind === 'error' ? 'Error: ' : 'Done: '}</strong>
        {children}
      </p>
      {onDismiss && (
        <button type="button" className="btn btn-quiet" onClick={onDismiss}>
          Dismiss message
        </button>
      )}
    </div>
  );
}
