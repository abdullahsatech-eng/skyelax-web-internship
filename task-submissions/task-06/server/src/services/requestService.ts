import { AppError } from '../errors/appError';
import type { RequestFields, ServiceRequest } from '../types/serviceRequest';
import type { ListOptions, ListResult, RequestRepository } from './requestRepository';

/** Business rules around service requests. Keeps controllers free of persistence details. */
export class RequestService {
  constructor(private readonly repository: RequestRepository) {}

  list(options: ListOptions): Promise<ListResult> {
    return this.repository.list(options);
  }

  async getById(id: string): Promise<ServiceRequest> {
    const found = await this.repository.findById(id);
    if (!found) throw AppError.notFound();
    return found;
  }

  create(fields: RequestFields): Promise<ServiceRequest> {
    return this.repository.create(fields);
  }

  async replace(id: string, fields: RequestFields): Promise<ServiceRequest> {
    const updated = await this.repository.update(id, fields);
    if (!updated) throw AppError.notFound();
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.remove(id);
    if (!deleted) throw AppError.notFound();
  }
}
