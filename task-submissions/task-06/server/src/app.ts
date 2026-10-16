import cors from 'cors';
import express, { type Express } from 'express';
import { createRequestController } from './controllers/requestController';
import { createErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { createRequestRoutes } from './routes/requestRoutes';
import type { RequestRepository } from './services/requestRepository';
import { RequestService } from './services/requestService';

export interface AppDependencies {
  requestRepository: RequestRepository;
  /** Resolves true when the database is reachable; may reject or resolve false when it is not. */
  checkDatabase: () => Promise<boolean>;
  corsOrigins: string[];
  logErrors?: boolean;
}

export const API_BASE_PATH = '/api/v1';

export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    cors({ origin: dependencies.corsOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get(`${API_BASE_PATH}/health`, async (_req, res) => {
    let databaseUp = false;
    try {
      databaseUp = await dependencies.checkDatabase();
    } catch {
      databaseUp = false;
    }

    if (databaseUp) {
      res.status(200).json({
        data: { status: 'ok', database: 'up', uptimeSeconds: Math.round(process.uptime()) },
      });
      return;
    }
    res.status(503).json({
      error: { code: 'SERVICE_UNAVAILABLE', message: 'The API is running but the database is unavailable.' },
    });
  });

  const service = new RequestService(dependencies.requestRepository);
  app.use(`${API_BASE_PATH}/requests`, createRequestRoutes(createRequestController(service)));

  app.use(notFoundHandler);
  app.use(createErrorHandler({ logErrors: dependencies.logErrors ?? true }));
  return app;
}
