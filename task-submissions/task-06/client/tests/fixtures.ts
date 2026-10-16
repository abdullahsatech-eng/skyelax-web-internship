import type { ListMeta, ServiceRequest } from '../src/types/serviceRequest';
import type { ListResponse } from '../src/api/requests';

export function makeRequest(overrides: Partial<ServiceRequest> = {}): ServiceRequest {
  return {
    id: '65f000000000000000000001',
    title: 'Printer jams on floor 2',
    description: 'The shared printer jams on every second page.',
    category: 'it',
    priority: 'medium',
    status: 'open',
    requesterName: 'Demo Requester',
    requesterEmail: 'demo@example.com',
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
    ...overrides,
  };
}

export function makeListResponse(items: ServiceRequest[], metaOverrides: Partial<ListMeta> = {}): ListResponse {
  const statusCounts = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
  for (const item of items) statusCounts[item.status] += 1;
  return {
    data: items,
    meta: {
      page: 1,
      limit: 8,
      total: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      statusCounts,
      ...metaOverrides,
    },
  };
}
