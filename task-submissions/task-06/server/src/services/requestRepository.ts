import type {
  Category,
  Priority,
  RequestFields,
  ServiceRequest,
  Status,
  StatusCounts,
} from '../types/serviceRequest';

export interface ListOptions {
  search?: string;
  status?: Status;
  priority?: Priority;
  category?: Category;
  page: number;
  limit: number;
}

export interface ListResult {
  items: ServiceRequest[];
  /** Number of records matching the filters (ignores pagination). */
  total: number;
  /** Counts per status across the whole collection (ignores filters). */
  statusCounts: StatusCounts;
}

/** Data-access contract. The API depends on this, not on MongoDB directly. */
export interface RequestRepository {
  list(options: ListOptions): Promise<ListResult>;
  findById(id: string): Promise<ServiceRequest | null>;
  create(fields: RequestFields): Promise<ServiceRequest>;
  update(id: string, fields: RequestFields): Promise<ServiceRequest | null>;
  remove(id: string): Promise<boolean>;
}

export function emptyStatusCounts(): StatusCounts {
  return { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
}
