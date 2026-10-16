import type { ListFilters, ListMeta, RequestPayload, ServiceRequest } from '../types/serviceRequest';
import { apiRequest } from './http';

export const PAGE_SIZE = 8;

export interface ListResponse {
  data: ServiceRequest[];
  meta: ListMeta;
}

export function listRequests(
  filters: ListFilters,
  page: number,
  signal?: AbortSignal,
): Promise<ListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  const search = filters.search.trim();
  if (search) params.set('search', search);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.category) params.set('category', filters.category);
  return apiRequest<ListResponse>(`/requests?${params.toString()}`, { signal });
}

export async function getRequest(id: string, signal?: AbortSignal): Promise<ServiceRequest> {
  const response = await apiRequest<{ data: ServiceRequest }>(`/requests/${encodeURIComponent(id)}`, { signal });
  return response.data;
}

export async function createRequest(payload: RequestPayload): Promise<ServiceRequest> {
  const response = await apiRequest<{ data: ServiceRequest }>('/requests', { method: 'POST', body: payload });
  return response.data;
}

export async function updateRequest(id: string, payload: RequestPayload): Promise<ServiceRequest> {
  const response = await apiRequest<{ data: ServiceRequest }>(`/requests/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload,
  });
  return response.data;
}

export async function deleteRequest(id: string): Promise<void> {
  await apiRequest<void>(`/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
