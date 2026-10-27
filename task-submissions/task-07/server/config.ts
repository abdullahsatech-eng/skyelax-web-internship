import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  mongodbUri: string;
  mongodbDatabase: string;
  port: number;
}

const PLACEHOLDER_PATTERNS = [/your_mongodb/i, /<password>/i, /<username>/i];

/** Reads and validates environment configuration. Throws a readable error if it is unusable. */
export function loadConfig(): AppConfig {
  const mongodbUri = process.env.MONGODB_URI?.trim();
  if (!mongodbUri || PLACEHOLDER_PATTERNS.some((p) => p.test(mongodbUri))) {
    throw new Error(
      'MONGODB_URI is missing or still a placeholder. Copy server/.env.example to server/.env and add your own MongoDB Atlas connection string.',
    );
  }

  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a whole number between 1 and 65535.');
  }

  return {
    mongodbUri,
    mongodbDatabase: process.env.MONGODB_DATABASE?.trim() || 'stockdesk',
    port,
  };
}
