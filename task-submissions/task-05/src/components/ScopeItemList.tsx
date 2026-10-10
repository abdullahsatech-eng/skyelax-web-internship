import type { ScopeItem } from '../types';
import { Icon } from './ui/Icon';

export function ScopeItemList({ items }: { items: ScopeItem[] }) {
  return (
    <ul className="scope-list">
      {items.map((item) => (
        <li key={item.id} className="scope-list__item">
          <Icon name="check" size={16} className="scope-list__icon" />
          <div>
            <p className="scope-list__title">{item.title}</p>
            {item.description ? <p className="scope-list__text">{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
