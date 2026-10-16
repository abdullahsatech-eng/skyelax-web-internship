import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app';
import { checkDatabase, connectDatabase } from './config/database';
import { loadConfig } from './config/env';
import { MongoRequestRepository } from './services/mongoRequestRepository';

async function main(): Promise<void> {
  const config = loadConfig();
  await connectDatabase(config.mongodbUri);
  console.log('[database] connected');

  const app = createApp({
    requestRepository: new MongoRequestRepository(),
    checkDatabase,
    corsOrigins: config.clientOrigins,
  });

  const server = app.listen(config.port, () => {
    console.log(`[server] FixFlow API listening on port ${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error: unknown) => {
  console.error('[server] failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
