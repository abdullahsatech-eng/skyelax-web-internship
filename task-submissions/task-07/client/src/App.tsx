import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  fetchSuppliers,
  updateProduct,
} from './api/stockdeskApi';
import { ApiError } from './api/http';
import type { Category, Product, ProductInput, Supplier } from './api/types';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Notice, type NoticeKind } from './components/Notice';
import { ProductForm } from './components/ProductForm';
import { ProductTable } from './components/ProductTable';

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };
type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; product: Product };
interface NoticeState {
  kind: NoticeKind;
  text: string;
}

function messageFrom(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something unexpected went wrong. Please try again.';
}

export default function App() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<FormState>({ mode: 'closed' });
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadAll = useCallback(async () => {
    setLoad({ status: 'loading' });
    try {
      const [loadedProducts, loadedCategories, loadedSuppliers] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSuppliers(),
      ]);
      setProducts(loadedProducts);
      setCategories(loadedCategories);
      setSuppliers(loadedSuppliers);
      setLoad({ status: 'ready' });
    } catch (err) {
      setLoad({ status: 'error', message: messageFrom(err) });
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function refreshProducts() {
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setNotice({ kind: 'error', text: `Saved, but the list could not be refreshed. ${messageFrom(err)}` });
    }
  }

  async function handleSave(input: ProductInput) {
    // Errors are thrown on purpose: the form shows them and keeps the user's entries.
    if (form.mode === 'edit') {
      const saved = await updateProduct(form.product.id, input);
      setNotice({ kind: 'success', text: `${saved.name} was updated.` });
    } else {
      const saved = await createProduct(input);
      setNotice({ kind: 'success', text: `${saved.name} was added to the inventory.` });
    }
    setForm({ mode: 'closed' });
    await refreshProducts();
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(toDelete.id);
      setProducts((current) => current.filter((p) => p.id !== toDelete.id));
      setNotice({ kind: 'success', text: `${toDelete.name} was deleted.` });
      setToDelete(null);
    } catch (err) {
      setDeleteError(messageFrom(err));
    } finally {
      setDeleting(false);
    }
  }

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!categoryFilter || p.categoryId === categoryFilter) &&
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)),
    );
  }, [products, search, categoryFilter]);

  const referencesMissing = categories.length === 0 || suppliers.length === 0;
  const filtersActive = search.trim() !== '' || categoryFilter !== '';

  return (
    <>
      <a className="skip-link" href="#inventory">
        Skip to inventory
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <p className="brand">StockDesk</p>
          <nav aria-label="Main">
            <ul>
              <li>
                <a href="#inventory" aria-current="page">
                  Inventory
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="inventory" className="container">
        <div className="page-head">
          <h1>Inventory</h1>
          {form.mode === 'closed' && load.status === 'ready' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setForm({ mode: 'create' })}
              disabled={referencesMissing}
            >
              Add product
            </button>
          )}
        </div>

        {notice && (
          <Notice kind={notice.kind} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Notice>
        )}

        {load.status === 'loading' && (
          <p className="state" role="status">
            <span className="spinner" aria-hidden="true" /> Loading inventory...
          </p>
        )}

        {load.status === 'error' && (
          <div className="panel state-error" role="alert">
            <h2>Could not load the inventory</h2>
            <p>{load.message}</p>
            <button type="button" className="btn btn-primary" onClick={() => void loadAll()}>
              Try again
            </button>
          </div>
        )}

        {load.status === 'ready' && (
          <>
            {referencesMissing && (
              <p className="callout">
                No {categories.length === 0 ? 'categories' : 'suppliers'} found in the database, so products cannot be
                added yet. Run <code>npm run db:setup</code> in the server folder, then reload this page.
              </p>
            )}

            {form.mode !== 'closed' && (
              <ProductForm
                key={form.mode === 'edit' ? form.product.id : 'new'}
                product={form.mode === 'edit' ? form.product : undefined}
                categories={categories}
                suppliers={suppliers}
                onSubmit={handleSave}
                onCancel={() => setForm({ mode: 'closed' })}
              />
            )}

            {products.length > 0 && (
              <div className="toolbar">
                <div className="field">
                  <label htmlFor="search">Search by name or SKU</label>
                  <input
                    id="search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="field">
                  <label htmlFor="category-filter">Filter by category</label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <div className="panel state-empty">
                <h2>No products yet</h2>
                <p>Add your first product to start tracking stock.</p>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="panel state-empty">
                <h2>No products match your filters</h2>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('');
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <p className="count" aria-live="polite">
                  {filtersActive
                    ? `Showing ${visibleProducts.length} of ${products.length} products`
                    : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
                </p>
                <ProductTable
                  products={visibleProducts}
                  onEdit={(product) => setForm({ mode: 'edit', product })}
                  onDelete={(product) => {
                    setDeleteError(null);
                    setToDelete(product);
                  }}
                />
              </>
            )}
          </>
        )}
      </main>

      {toDelete && (
        <ConfirmDialog
          productName={toDelete.name}
          busy={deleting}
          error={deleteError}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
