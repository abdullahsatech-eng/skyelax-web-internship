export const CATEGORIES = ['it', 'maintenance', 'electrical', 'plumbing', 'other'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const STATUSES = ['open', 'in-progress', 'resolved', 'closed'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

/** The fields a client is allowed to write. */
export interface RequestFields {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requesterName: string;
  requesterEmail: string;
}

/** The public representation returned by the API. */
export interface ServiceRequest extends RequestFields {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusCounts = Record<Status, number>;
