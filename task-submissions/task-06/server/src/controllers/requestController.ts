import type { Request, Response } from 'express';
import { AppError } from '../errors/appError';
import type { RequestService } from '../services/requestService';
import { createRequestSchema, listQuerySchema, replaceRequestSchema } from '../validators/requestSchemas';
import { parseWith } from '../validators/validate';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

/** Rejects anything that is not a 24-character hex MongoDB id (400, not 404). */
function parseId(value: unknown): string {
  if (typeof value !== 'string' || !OBJECT_ID_PATTERN.test(value)) {
    throw AppError.badRequest('INVALID_ID', 'The request ID is not valid.');
  }
  return value;
}

export function createRequestController(service: RequestService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const query = parseWith(listQuerySchema, req.query);
      const result = await service.list(query);
      res.status(200).json({
        data: result.items,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
          statusCounts: result.statusCounts,
        },
      });
    },

    async getOne(req: Request, res: Response): Promise<void> {
      const id = parseId(req.params.id);
      res.status(200).json({ data: await service.getById(id) });
    },

    async create(req: Request, res: Response): Promise<void> {
      const fields = parseWith(createRequestSchema, req.body ?? {});
      const created = await service.create(fields);
      res.status(201).location(`/api/v1/requests/${created.id}`).json({ data: created });
    },

    async replace(req: Request, res: Response): Promise<void> {
      const id = parseId(req.params.id);
      const fields = parseWith(replaceRequestSchema, req.body ?? {});
      res.status(200).json({ data: await service.replace(id, fields) });
    },

    async remove(req: Request, res: Response): Promise<void> {
      const id = parseId(req.params.id);
      await service.remove(id);
      res.status(204).end();
    },
  };
}

export type RequestController = ReturnType<typeof createRequestController>;
