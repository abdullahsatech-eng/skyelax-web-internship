import { useEffect, useRef, useState } from 'react';
import { createId } from '../lib/ids';
import { scopeFieldId, type FieldErrors } from '../lib/validation';
import type { ScopeItem } from '../types';
import { Button } from './ui/Button';
import { TextAreaField, TextField } from './ui/Field';

interface ScopeItemsEditorProps {
  items: ScopeItem[];
  errors: FieldErrors;
  onAdd: (item: ScopeItem) => void;
  onChange: (id: string, patch: Partial<Pick<ScopeItem, 'title' | 'description'>>) => void;
  onRemove: (id: string) => void;
}

/** Editable list of original scope items. Edits stay in the form until the project is saved. */
export function ScopeItemsEditor({ items, errors, onAdd, onChange, onRemove }: ScopeItemsEditorProps) {
  const [announcement, setAnnouncement] = useState('');
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const focusNewId = useRef<string | null>(null);

  useEffect(() => {
    if (focusNewId.current) {
      document.getElementById(scopeFieldId(focusNewId.current, 'title'))?.focus();
      focusNewId.current = null;
    }
  }, [items.length]);

  const add = () => {
    const item: ScopeItem = { id: createId('sc'), title: '', description: '' };
    focusNewId.current = item.id;
    onAdd(item);
    setAnnouncement(`Scope item ${items.length + 1} added.`);
  };

  const remove = (item: ScopeItem, position: number) => {
    onRemove(item.id);
    setAnnouncement(`Scope item ${position} removed. It is gone for good once you save the project.`);
    addButtonRef.current?.focus();
  };

  return (
    <div className="scope-editor">
      {items.length === 0 ? (
        <p className="scope-editor__empty">
          No scope items yet. List what the client agreed to, so later changes can be compared against it.
        </p>
      ) : (
        <ol className="scope-editor__list">
          {items.map((item, index) => {
            const position = index + 1;
            return (
              <li key={item.id} className="scope-editor__item">
                <div className="scope-editor__item-head">
                  <p className="scope-editor__item-title">Scope item {position}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash"
                    onClick={() => remove(item, position)}
                    aria-label={`Remove scope item ${position}${item.title.trim() ? `: ${item.title.trim()}` : ''}`}
                  >
                    Remove
                  </Button>
                </div>
                <TextField
                  id={scopeFieldId(item.id, 'title')}
                  label="Title"
                  required
                  value={item.title}
                  error={errors[scopeFieldId(item.id, 'title')]}
                  onChange={(title) => onChange(item.id, { title })}
                />
                <TextAreaField
                  id={scopeFieldId(item.id, 'description')}
                  label="Description"
                  rows={2}
                  hint="Optional. Say what is and is not included."
                  value={item.description}
                  error={errors[scopeFieldId(item.id, 'description')]}
                  onChange={(description) => onChange(item.id, { description })}
                />
              </li>
            );
          })}
        </ol>
      )}
      <Button ref={addButtonRef} variant="secondary" icon="plus" onClick={add}>
        Add scope item
      </Button>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
