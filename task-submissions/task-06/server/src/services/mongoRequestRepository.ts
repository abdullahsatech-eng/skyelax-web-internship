import type { FilterQuery } from 'mongoose';
import {
  ServiceRequestModel,
  type ServiceRequestDocument,
  type StoredServiceRequest,
} from '../models/serviceRequestModel';
import type { RequestFields, ServiceRequest, Status } from '../types/serviceRequest';
import {
  emptyStatusCounts,
  type ListOptions,
  type ListResult,
  type RequestRepository,
} from './requestRepository';

function toServiceRequest(doc: StoredServiceRequest): ServiceRequest {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    requesterName: doc.requesterName,
    requesterEmail: doc.requesterEmail,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter(options: ListOptions): FilterQuery<ServiceRequestDocument> {
  const filter: FilterQuery<ServiceRequestDocument> = {};
  if (options.status) filter.status = options.status;
  if (options.priority) filter.priority = options.priority;
  if (options.category) filter.category = options.category;
  if (options.search) {
    const pattern = { $regex: escapeRegExp(options.search), $options: 'i' };
    filter.$or = [{ title: pattern }, { description: pattern }, { requesterName: pattern }];
  }
  return filter;
}

export class MongoRequestRepository implements RequestRepository {
  async list(options: ListOptions): Promise<ListResult> {
    const filter = buildFilter(options);
    const [docs, total, grouped] = await Promise.all([
      ServiceRequestModel.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .lean<StoredServiceRequest[]>(),
      ServiceRequestModel.countDocuments(filter),
      ServiceRequestModel.aggregate<{ _id: Status; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts = emptyStatusCounts();
    for (const row of grouped) {
      if (row._id in statusCounts) statusCounts[row._id] = row.count;
    }
    return { items: docs.map(toServiceRequest), total, statusCounts };
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    const doc = await ServiceRequestModel.findById(id).lean<StoredServiceRequest>();
    return doc ? toServiceRequest(doc) : null;
  }

  async create(fields: RequestFields): Promise<ServiceRequest> {
    const created = await ServiceRequestModel.create(fields);
    return toServiceRequest(created.toObject() as unknown as StoredServiceRequest);
  }

  async update(id: string, fields: RequestFields): Promise<ServiceRequest | null> {
    const doc = await ServiceRequestModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true },
    ).lean<StoredServiceRequest>();
    return doc ? toServiceRequest(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await ServiceRequestModel.findByIdAndDelete(id).lean();
    return deleted !== null;
  }
}
