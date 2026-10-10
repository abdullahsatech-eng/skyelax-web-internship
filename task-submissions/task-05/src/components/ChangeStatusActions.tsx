import { allowedTransitions, transitionActionLabel } from '../lib/statusRules';
import { useAppActions } from '../state/useAppActions';
import type { ChangeRequest, ChangeStatus } from '../types';
import { Button } from './ui/Button';
import type { IconName } from './ui/Icon';

const ACTION_ICONS: Record<ChangeStatus, IconName> = {
  draft: 'undo',
  pending_review: 'send',
  approved: 'check',
  rejected: 'x',
};

/** Offers only the transitions that are allowed from the current status. */
export function ChangeStatusActions({ change }: { change: ChangeRequest }) {
  const actions = useAppActions();
  return (
    <div className="button-row">
      {allowedTransitions(change.status).map((target) => (
        <Button
          key={target}
          variant={target === 'approved' || (target === 'pending_review' && change.status === 'draft') ? 'primary' : 'secondary'}
          icon={ACTION_ICONS[target]}
          onClick={() => actions.setChangeStatus(change, target)}
        >
          {transitionActionLabel(change.status, target)}
        </Button>
      ))}
    </div>
  );
}
