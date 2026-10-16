export const CATEGORIES = ['it', 'maintenance', 'electrical', 'plumbing', 'other'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const STATUSES = ['open', 'in-progress', 'resolved', 'closed'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  it: 'IT support',
  maintenance: 'Maintenance',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  other: 'Other',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
  updatedAt: string;
}

/** What the create/edit form holds. Category is empty until the user chooses. */
export interface RequestFormValues {
  title: string;
  description: string;
  category: Category | '';
  priority: Priority;
  status: Status;
  requesterName: string;
  requesterEmail: string;
}

/** The payload accepted by the API (category is guaranteed once validated). */
export type RequestPayload = Omit<RequestFormValues, 'category'> & { category: Category };

export type StatusCounts = Record<Status, number>;

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: StatusCounts;
}

export interface ListFilters {
  search: string;
  status: Status | '';
  priority: Priority | '';
  category: Category | '';
}

export const EMPTY_FILTERS: ListFilters = { search: '', status: '', priority: '', category: '' };

export const EMPTY_FORM_VALUES: RequestFormValues = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  status: 'open',
  requesterName: '',
  requesterEmail: '',
};
