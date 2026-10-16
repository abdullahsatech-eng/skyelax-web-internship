import type {
  ListOptions,
  ListResult,
  RequestRepository,
} from '../../src/services/requestRepository';
import { emptyStatusCounts } from '../../src/services/requestRepository';
import type { RequestFields, ServiceRequest } from '../../src/types/serviceRequest';

/** Test double with the same behaviour contract as the MongoDB repository. */
export class InMemoryRequestRepository implements RequestRepository {
  private items: ServiceRequest[] = [];
  private counter = 0;
  private clock = Date.UTC(2026, 0, 1);

  private nextId(): string {
    this.counter += 1;
    return this.counter.toString(16).padStart(24, '0');
  }

  /** Deterministic, strictly increasing timestamps. */
  private tick(): string {
    this.clock += 1000;
    return new Date(this.clock).toISOString();
  }

  async list(options: ListOptions): Promise<ListResult> {
    const search = options.search?.toLowerCase();
    const matching = this.items
      .filter((item) => !options.status || item.status === options.status)
      .filter((item) => !options.priority || item.priority === options.priority)
      .filter((item) => !options.category || item.category === options.category)
      .filter(
        (item) =>
          !search ||
          [item.title, item.description, item.requesterName].some((value) =>
            value.toLowerCase().includes(search),
          ),
      )
      .reverse(); // newest first

    const start = (options.page - 1) * options.limit;
    const statusCounts = emptyStatusCounts();
    for (const item of this.items) statusCounts[item.status] += 1;

    return {
      items: matching.slice(start, start + options.limit),
      total: matching.length,
      statusCounts,
    };
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async create(fields: RequestFields): Promise<ServiceRequest> {
    const now = this.tick();
    const created: ServiceRequest = { ...fields, id: this.nextId(), createdAt: now, updatedAt: now };
    this.items.push(created);
    return created;
  }

  async update(id: string, fields: RequestFields): Promise<ServiceRequest | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated: ServiceRequest = { ...this.items[index], ...fields, updatedAt: this.tick() };
    this.items[index] = updated;
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < before;
  }
}

/** A repository whose every method fails with the given error. */
export function failingRepository(error: Error): RequestRepository {
  const fail = async (): Promise<never> => {
    throw error;
  };
  return { list: fail, findById: fail, create: fail, update: fail, remove: fail };
}
