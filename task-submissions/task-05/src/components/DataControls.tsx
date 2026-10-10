import { useState } from 'react';
import { useAppData } from '../state/AppContext';
import { useAppActions } from '../state/useAppActions';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';

/** Footer controls for the demonstration data. Both actions are destructive, so both ask first. */
export function DataControls() {
  const { data } = useAppData();
  const actions = useAppActions();
  const [dialog, setDialog] = useState<'reset' | 'clear' | null>(null);

  return (
    <div className="data-controls">
      <p className="data-controls__text">
        ScopeBridge is a frontend prototype. Fictional demo data is stored only in this browser, so it is not shared between devices or people.
      </p>
      <div className="button-row">
        <Button variant="ghost" size="sm" icon="refresh" onClick={() => setDialog('reset')}>
          Reset demo data
        </Button>
        <Button variant="ghost" size="sm" icon="trash" onClick={() => setDialog('clear')} disabled={data.projects.length === 0 && data.changeRequests.length === 0}>
          Clear all data
        </Button>
      </div>

      <ConfirmDialog
        open={dialog === 'reset'}
        title="Reset to the demo data?"
        confirmLabel="Reset demo data"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          actions.loadDemoData();
          setDialog(null);
        }}
      >
        Your current projects and change requests will be replaced by the original fictional demo data. This cannot be undone.
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'clear'}
        title="Remove all data?"
        confirmLabel="Remove everything"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          actions.clearAllData();
          setDialog(null);
        }}
      >
        All projects, scope items and change requests in this browser will be deleted. You can load the demo data again afterwards.
      </ConfirmDialog>
    </div>
  );
}
