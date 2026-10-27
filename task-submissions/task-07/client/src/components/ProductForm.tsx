import { useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api/http';
import type { Category, Product, ProductInput, Supplier } from '../api/types';
import {
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from '../lib/validateProduct';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  suppliers: Supplier[];
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

const FIELD_ORDER: (keyof ProductFormValues)[] = ['name', 'sku', 'categoryId', 'supplierId', 'price', 'quantity'];

function initialValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    categoryId: product?.categoryId ?? '',
    supplierId: product?.supplierId ?? '',
    price: product?.price ?? '',
    quantity: product === undefined ? '' : String(product.quantity),
  };
}

export function ProductForm({ product, categories, suppliers, onSubmit, onCancel }: ProductFormProps) {
  const isEdit = product !== undefined;
  const [values, setValues] = useState<ProductFormValues>(() => initialValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function setField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function focusField(field: keyof ProductFormValues) {
    formRef.current?.querySelector<HTMLElement>(`#pf-${field}`)?.focus();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found = validateProduct(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        sku: values.sku.trim(),
        categoryId: values.categoryId,
        supplierId: values.supplierId,
        price: values.price.trim(),
        quantity: Number(values.quantity.trim()),
      });
    } catch (err) {
      // Keep everything the user typed; show what the server rejected.
      if (err instanceof ApiError) {
        const serverErrors: ProductFormErrors = {};
        for (const detail of err.details) {
          if (FIELD_ORDER.includes(detail.field as keyof ProductFormValues)) {
            serverErrors[detail.field as keyof ProductFormValues] = detail.message;
          }
        }
        setErrors(serverErrors);
        setFormError(err.message);
        const first = FIELD_ORDER.find((field) => serverErrors[field]);
        if (first) focusField(first);
      } else {
        setFormError('Something went wrong while saving. Your entries are still here - try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  function describedBy(field: keyof ProductFormValues, hint?: boolean) {
    const ids = [];
    if (hint) ids.push(`pf-${field}-hint`);
    if (errors[field]) ids.push(`pf-${field}-error`);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  function error(field: keyof ProductFormValues) {
    return errors[field] ? (
      <p className="field-error" id={`pf-${field}-error`}>
        Error: {errors[field]}
      </p>
    ) : null;
  }

  return (
    <div className="panel">
      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby="product-form-title">
        <h2 id="product-form-title">{isEdit ? 'Edit product' : 'Add product'}</h2>

        {formError && (
          <p className="field-error form-error" role="alert">
            Error: {formError}
          </p>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="pf-name">
              Product name <span className="req">(required)</span>
            </label>
            <input
              id="pf-name"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy('name')}
              maxLength={120}
              autoComplete="off"
            />
            {error('name')}
          </div>

          <div className="field">
            <label htmlFor="pf-sku">
              SKU <span className="req">(required)</span>
            </label>
            <input
              id="pf-sku"
              value={values.sku}
              onChange={(e) => setField('sku', e.target.value)}
              aria-invalid={Boolean(errors.sku)}
              aria-describedby={describedBy('sku', true)}
              maxLength={40}
              autoComplete="off"
            />
            <p className="hint" id="pf-sku-hint">
              Must be unique. Saved in capitals.
            </p>
            {error('sku')}
          </div>

          <div className="field">
            <label htmlFor="pf-categoryId">
              Category <span className="req">(required)</span>
            </label>
            <select
              id="pf-categoryId"
              value={values.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={describedBy('categoryId')}
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {error('categoryId')}
          </div>

          <div className="field">
            <label htmlFor="pf-supplierId">
              Supplier <span className="req">(required)</span>
            </label>
            <select
              id="pf-supplierId"
              value={values.supplierId}
              onChange={(e) => setField('supplierId', e.target.value)}
              aria-invalid={Boolean(errors.supplierId)}
              aria-describedby={describedBy('supplierId')}
            >
              <option value="">Choose a supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {error('supplierId')}
          </div>

          <div className="field">
            <label htmlFor="pf-price">
              Price <span className="req">(required)</span>
            </label>
            <input
              id="pf-price"
              value={values.price}
              onChange={(e) => setField('price', e.target.value)}
              inputMode="decimal"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={describedBy('price', true)}
              autoComplete="off"
            />
            <p className="hint" id="pf-price-hint">
              For example 12.50. Zero or more.
            </p>
            {error('price')}
          </div>

          <div className="field">
            <label htmlFor="pf-quantity">
              Quantity in stock <span className="req">(required)</span>
            </label>
            <input
              id="pf-quantity"
              value={values.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              inputMode="numeric"
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={describedBy('quantity', true)}
              autoComplete="off"
            />
            <p className="hint" id="pf-quantity-hint">
              A whole number, zero or more.
            </p>
            {error('quantity')}
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
