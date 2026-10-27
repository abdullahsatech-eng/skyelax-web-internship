import cors from 'cors';
import express from 'express';
import { isDatabaseConnected } from './db/connection';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requireDatabase } from './middleware/requireDatabase';
import { productsRouter } from './routes/products';
import { categoriesRouter, suppliersRouter } from './routes/referenceData';

/** Builds the Express app. It does not open a database connection; server.ts does that. */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: isDatabaseConnected() ? 'connected' : 'disconnected' });
  });

  app.use('/api', requireDatabase);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/suppliers', suppliersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
