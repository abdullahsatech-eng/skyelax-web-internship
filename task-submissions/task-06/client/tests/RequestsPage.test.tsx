import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../src/api/requests';
import { ApiError } from '../src/api/http';
import { RequestsPage } from '../src/features/requests/RequestsPage';
import { makeListResponse, makeRequest } from './fixtures';

// The API module is mocked: these tests prove UI behaviour, not full-stack integration.
vi.mock('../src/api/requests', () => ({
  PAGE_SIZE: 8,
  listRequests: vi.fn(),
  getRequest: vi.fn(),
  createRequest: vi.fn(),
  updateRequest: vi.fn(),
  deleteRequest: vi.fn(),
}));

const mocked = vi.mocked(api);
const printer = makeRequest();

beforeEach(() => {
  vi.resetAllMocks();
});

async function renderLoaded(items = [printer]) {
  mocked.listRequests.mockResolvedValue(makeListResponse(items));
  render(<RequestsPage />);
  if (items.length > 0) await screen.findByText(items[0].title);
}

describe('loading, data and empty states', () => {
  it('shows a loading state before the API responds', async () => {
    let resolve!: (value: ReturnType<typeof makeListResponse>) => void;
    mocked.listRequests.mockReturnValue(
      new Promise<ReturnType<typeof makeListResponse>>((r) => {
        resolve = r;
      }),
    );
    render(<RequestsPage />);
    expect(screen.getByText(/loading requests/i)).toBeInTheDocument();
    resolve(makeListResponse([printer]));
    expect(await screen.findByText(printer.title)).toBeInTheDocument();
    expect(screen.queryByText(/loading requests/i)).not.toBeInTheDocument();
  });

  it('renders the data returned by the API', async () => {
    await renderLoaded([printer, makeRequest({ id: '65f000000000000000000002', title: 'Leaking tap in kitchenette', status: 'resolved', priority: 'urgent', category: 'plumbing' })]);
    expect(screen.getByText('Leaking tap in kitchenette')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    expect(screen.getByText('2 requests in total')).toBeInTheDocument();
    expect(mocked.listRequests).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state with a create action when there are no requests', async () => {
    await renderLoaded([]);
    expect(await screen.findByText(/no service requests yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create the first request/i })).toBeInTheDocument();
  });

  it('shows a "no matches" state when filters return nothing', async () => {
    const user = userEvent.setup();
    mocked.listRequests.mockImplementation(async (filters) =>
      filters.search ? makeListResponse([]) : makeListResponse([printer]),
    );
    render(<RequestsPage />);
    await screen.findByText(printer.title);
    await user.type(screen.getByLabelText(/search requests/i), 'zzz');
    expect(await screen.findByText(/no requests match these filters/i)).toBeInTheDocument();
  });

  it('shows an error with a retry action when the API fails, then recovers', async () => {
    const user = userEvent.setup();
    mocked.listRequests
      .mockRejectedValueOnce(new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR'))
      .mockResolvedValueOnce(makeListResponse([printer]));
    render(<RequestsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/cannot reach the server/i);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText(printer.title)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('create', () => {
  it('blocks submission and shows inline messages when the form is invalid', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole('button', { name: 'New request' }));
    const dialog = screen.getByRole('dialog', { name: /new service request/i });
    await user.click(within(dialog).getByRole('button', { name: 'Create request' }));

    expect(within(dialog).getByText('Title is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Description is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Choose a category', { selector: 'p' })).toBeInTheDocument();
    expect(within(dialog).getByText('Requester email is required')).toBeInTheDocument();
    expect(mocked.createRequest).not.toHaveBeenCalled();
  });

  it('creates a request, shows success feedback and refreshes the list', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.createRequest.mockResolvedValue(makeRequest({ id: '65f000000000000000000009' }));

    await user.click(screen.getByRole('button', { name: 'New request' }));
    const dialog = screen.getByRole('dialog', { name: /new service request/i });
    await user.type(within(dialog).getByLabelText(/^title/i), 'Projector will not turn on');
    await user.type(within(dialog).getByLabelText(/^description/i), 'The projector in room B shows no signal.');
    await user.selectOptions(within(dialog).getByLabelText(/^category/i), 'it');
    await user.selectOptions(within(dialog).getByLabelText(/^priority/i), 'high');
    await user.type(within(dialog).getByLabelText(/^requester name/i), 'Demo Requester');
    await user.type(within(dialog).getByLabelText(/^requester email/i), 'demo@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Create request' }));

    await waitFor(() =>
      expect(mocked.createRequest).toHaveBeenCalledWith({
        title: 'Projector will not turn on',
        description: 'The projector in room B shows no signal.',
        category: 'it',
        priority: 'high',
        status: 'open',
        requesterName: 'Demo Requester',
        requesterEmail: 'demo@example.com',
      }),
    );
    expect(await screen.findByText('Request created.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(mocked.listRequests).toHaveBeenCalledTimes(2));
  });

  it('keeps the typed input and shows server field errors when the API rejects the form', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.createRequest.mockRejectedValue(
      new ApiError('Some fields need attention. Please review the form.', 422, 'VALIDATION_ERROR', [
        { field: 'requesterEmail', message: 'Requester email must be a valid email address' },
      ]),
    );

    await user.click(screen.getByRole('button', { name: 'New request' }));
    const dialog = screen.getByRole('dialog', { name: /new service request/i });
    await user.type(within(dialog).getByLabelText(/^title/i), 'Projector will not turn on');
    await user.type(within(dialog).getByLabelText(/^description/i), 'The projector in room B shows no signal.');
    await user.selectOptions(within(dialog).getByLabelText(/^category/i), 'it');
    await user.type(within(dialog).getByLabelText(/^requester name/i), 'Demo Requester');
    await user.type(within(dialog).getByLabelText(/^requester email/i), 'a@b.co');
    await user.click(within(dialog).getByRole('button', { name: 'Create request' }));

    expect(await within(dialog).findByText('Requester email must be a valid email address')).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/^title/i)).toHaveValue('Projector will not turn on');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('view, edit and delete', () => {
  it('opens details fetched from the API', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.getRequest.mockResolvedValue(printer);
    await user.click(screen.getByRole('button', { name: `View ${printer.title}` }));
    const dialog = screen.getByRole('dialog', { name: /request details/i });
    expect(await within(dialog).findByText(printer.description)).toBeInTheDocument();
    expect(mocked.getRequest).toHaveBeenCalledWith(printer.id, expect.anything());
  });

  it('edits a request with the form pre-filled and shows success feedback', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.updateRequest.mockResolvedValue({ ...printer, title: 'Printer fixed', status: 'resolved' });

    await user.click(screen.getByRole('button', { name: `Edit ${printer.title}` }));
    const dialog = screen.getByRole('dialog', { name: /edit service request/i });
    const title = within(dialog).getByLabelText(/^title/i);
    expect(title).toHaveValue(printer.title);

    await user.clear(title);
    await user.type(title, 'Printer fixed');
    await user.selectOptions(within(dialog).getByLabelText(/^status/i), 'resolved');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mocked.updateRequest).toHaveBeenCalledWith(
        printer.id,
        expect.objectContaining({ title: 'Printer fixed', status: 'resolved', requesterEmail: printer.requesterEmail }),
      ),
    );
    expect(await screen.findByText('Request updated.')).toBeInTheDocument();
    await waitFor(() => expect(mocked.listRequests).toHaveBeenCalledTimes(2));
  });

  it('asks for confirmation before deleting and does nothing if cancelled', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: `Delete ${printer.title}` }));
    const dialog = screen.getByRole('dialog', { name: /delete this request/i });
    expect(mocked.deleteRequest).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocked.deleteRequest).not.toHaveBeenCalled();
  });

  it('deletes after confirmation, shows feedback and refreshes the list', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.deleteRequest.mockResolvedValue(undefined);

    await user.click(screen.getByRole('button', { name: `Delete ${printer.title}` }));
    const dialog = screen.getByRole('dialog', { name: /delete this request/i });
    await user.click(within(dialog).getByRole('button', { name: 'Delete request' }));

    await waitFor(() => expect(mocked.deleteRequest).toHaveBeenCalledWith(printer.id));
    expect(await screen.findByText('Request deleted.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(mocked.listRequests).toHaveBeenCalledTimes(2));
  });

  it('shows an error inside the dialog if deletion fails', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    mocked.deleteRequest.mockRejectedValue(new ApiError('This request no longer exists. It may have been deleted.', 404, 'NOT_FOUND'));

    await user.click(screen.getByRole('button', { name: `Delete ${printer.title}` }));
    const dialog = screen.getByRole('dialog', { name: /delete this request/i });
    await user.click(within(dialog).getByRole('button', { name: 'Delete request' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/no longer exists/i);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
