import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import type { Category, Product, Supplier } from './api/types';

// MOCKED API: these tests replace fetch with an in-memory fake. They verify UI behaviour only
// and are NOT evidence of real MongoDB connectivity or persistence.

const categories: Category[] = [
  { id: 'c1', name: 'Electronics' },
  { id: 'c2', name: 'Furniture' },
];
const suppliers: Supplier[] = [{ id: 's1', name: 'Apex Wholesale Ltd' }];

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Desk Lamp',
    sku: 'LAMP-001',
    categoryId: 'c1',
    supplierId: 's1',
    category: { id: 'c1', name: 'Electronics' },
    supplier: { id: 's1', name: 'Apex Wholesale Ltd' },
    price: '24.50',
    quantity: 12,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

interface Call {
  method: string;
  path: string;
  body?: Record<string, unknown>;
}

function installFakeApi(initial: Product[], overrides: Record<string, () => Response> = {}) {
  const products = [...initial];
  const calls: Call[] = [];
  const json = (status: number, payload?: unknown) =>
    new Response(payload === undefined ? null : JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const fake = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined;
    calls.push({ method, path, body });

    const override = overrides[`${method} ${path}`];
    if (override) return override();

    if (method === 'GET' && path === '/api/products') return json(200, { data: products });
    if (method === 'GET' && path === '/api/categories') return json(200, { data: categories });
    if (method === 'GET' && path === '/api/suppliers') return json(200, { data: suppliers });

    if (method === 'POST' && path === '/api/products') {
      const created = makeProduct({
        id: `p${products.length + 1}`,
        ...(body as Partial<Product>),
        quantity: Number(body?.quantity),
      });
      products.push(created);
      return json(201, { data: created });
    }
    const match = path.match(/^\/api\/products\/(.+)$/);
    if (match && method === 'PUT') {
      const index = products.findIndex((p) => p.id === match[1]);
      products[index] = { ...products[index], ...(body as Partial<Product>), quantity: Number(body?.quantity) };
      return json(200, { data: products[index] });
    }
    if (match && method === 'DELETE') {
      const index = products.findIndex((p) => p.id === match[1]);
      products.splice(index, 1);
      return json(204);
    }
    return json(404, { error: { code: 'ROUTE_NOT_FOUND', message: 'Not found.' } });
  });

  vi.stubGlobal('fetch', fake);
  return { calls, products };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StockDesk inventory page', () => {
  it('shows a loading state, then the products returned by the API', async () => {
    installFakeApi([makeProduct()]);
    render(<App />);

    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
    expect(await screen.findByText('Desk Lamp')).toBeInTheDocument();
    expect(screen.getByText('LAMP-001')).toBeInTheDocument();
    expect(screen.getByText('24.50')).toBeInTheDocument();
    expect(screen.getByText('1 product')).toBeInTheDocument();
  });

  it('shows a clear empty state when there are no products', async () => {
    installFakeApi([]);
    render(<App />);
    expect(await screen.findByRole('heading', { name: /no products yet/i })).toBeInTheDocument();
  });

  it('shows an error (not an empty list) when loading fails, and recovers on retry', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network down'));
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/cannot reach the stockdesk server/i);
    expect(screen.queryByText(/no products yet/i)).not.toBeInTheDocument();

    installFakeApi([makeProduct()]);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Desk Lamp')).toBeInTheDocument();
  });

  it('shows inline validation errors and sends nothing when the form is invalid', async () => {
    const { calls } = installFakeApi([makeProduct()]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Add product' }));
    const form = screen.getByRole('form', { name: /add product/i });
    await userEvent.click(within(form).getByRole('button', { name: 'Add product' }));

    expect(within(form).getByText(/enter a product name/i)).toBeInTheDocument();
    expect(within(form).getByText(/choose a category/i)).toBeInTheDocument();
    expect(within(form).getByText(/enter a quantity/i)).toBeInTheDocument();
    expect(calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('creates a product through the API and shows the persisted result', async () => {
    const { calls } = installFakeApi([makeProduct()]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Add product' }));
    const form = screen.getByRole('form', { name: /add product/i });
    await userEvent.type(within(form).getByLabelText(/^product name/i), 'Office Chair');
    await userEvent.type(within(form).getByLabelText(/^sku/i), 'chair-9');
    await userEvent.selectOptions(within(form).getByLabelText(/^category/i), 'c2');
    await userEvent.selectOptions(within(form).getByLabelText(/^supplier/i), 's1');
    await userEvent.type(within(form).getByLabelText(/^price/i), '99.90');
    await userEvent.type(within(form).getByLabelText(/^quantity/i), '4');
    await userEvent.click(within(form).getByRole('button', { name: 'Add product' }));

    expect(await screen.findByText('Office Chair')).toBeInTheDocument();
    expect(screen.getByText(/office chair was added/i)).toBeInTheDocument();
    const post = calls.find((c) => c.method === 'POST');
    expect(post?.body).toMatchObject({ name: 'Office Chair', price: '99.90', quantity: 4, categoryId: 'c2' });
    expect(screen.queryByRole('form', { name: /add product/i })).not.toBeInTheDocument();
  });

  it('keeps the entered values and shows the server message when saving fails', async () => {
    installFakeApi([makeProduct()], {
      'POST /api/products': () =>
        new Response(
          JSON.stringify({
            error: {
              code: 'DUPLICATE_VALUE',
              message: 'A product with this SKU already exists.',
              details: [{ field: 'sku', message: 'A product with this SKU already exists.' }],
            },
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } },
        ),
    });
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Add product' }));
    const form = screen.getByRole('form', { name: /add product/i });
    await userEvent.type(within(form).getByLabelText(/^product name/i), 'Second Lamp');
    await userEvent.type(within(form).getByLabelText(/^sku/i), 'LAMP-001');
    await userEvent.selectOptions(within(form).getByLabelText(/^category/i), 'c1');
    await userEvent.selectOptions(within(form).getByLabelText(/^supplier/i), 's1');
    await userEvent.type(within(form).getByLabelText(/^price/i), '5');
    await userEvent.type(within(form).getByLabelText(/^quantity/i), '1');
    await userEvent.click(within(form).getByRole('button', { name: 'Add product' }));

    expect((await within(form).findAllByText(/already exists/i)).length).toBeGreaterThan(0);
    expect(within(form).getByLabelText(/^product name/i)).toHaveValue('Second Lamp');
    expect(within(form).getByLabelText(/^price/i)).toHaveValue('5');
  });

  it('edits a product and shows the updated values', async () => {
    const { calls } = installFakeApi([makeProduct()]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Edit Desk Lamp' }));
    const form = screen.getByRole('form', { name: /edit product/i });
    const quantity = within(form).getByLabelText(/^quantity/i);
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '0');
    await userEvent.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText(/desk lamp was updated/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Out of stock')).toBeInTheDocument());
    expect(calls.find((c) => c.method === 'PUT')?.path).toBe('/api/products/p1');
  });

  it('asks for confirmation before deleting and does nothing when cancelled', async () => {
    const { calls } = installFakeApi([makeProduct()]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk Lamp' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent(/desk lamp/i);

    await userEvent.click(within(dialog).getByRole('button', { name: /keep product/i }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    expect(screen.getByText('Desk Lamp')).toBeInTheDocument();
  });

  it('removes the product only after the server confirms deletion', async () => {
    const { calls } = installFakeApi([makeProduct()]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk Lamp' }));
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /delete product/i }));

    expect(await screen.findByText(/desk lamp was deleted/i)).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'LAMP-001' })).not.toBeInTheDocument();
    expect(calls.some((c) => c.method === 'DELETE' && c.path === '/api/products/p1')).toBe(true);
  });

  it('keeps the product and shows an error when deletion fails', async () => {
    installFakeApi([makeProduct()], {
      'DELETE /api/products/p1': () =>
        new Response(JSON.stringify({ error: { code: 'DATABASE_UNAVAILABLE', message: 'The database is not reachable right now.' } }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
    });
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk Lamp' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /delete product/i }));

    expect(await within(dialog).findByText(/database is not reachable/i)).toBeInTheDocument();
    expect(screen.getByText('LAMP-001')).toBeInTheDocument();
  });

  it('filters products by search text', async () => {
    installFakeApi([
      makeProduct(),
      makeProduct({ id: 'p2', name: 'Office Chair', sku: 'CHAIR-1', categoryId: 'c2', category: { id: 'c2', name: 'Furniture' } }),
    ]);
    render(<App />);
    await screen.findByText('Desk Lamp');

    await userEvent.type(screen.getByLabelText(/search by name or sku/i), 'chair');
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
    expect(screen.getByText('Office Chair')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 2 products')).toBeInTheDocument();
  });
});
