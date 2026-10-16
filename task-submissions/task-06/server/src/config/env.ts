export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  mongodbUri: string;
  clientOrigins: string[];
}

const DEFAULT_DEV_ORIGIN = 'http://localhost:5173';

/**
 * Reads and validates environment variables. Throws a readable error at startup
 * instead of failing later with a confusing message.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';
  const isProduction = nodeEnv === 'production';
  const mongodbUri = env.MONGODB_URI?.trim();
  const rawOrigins = env.CLIENT_ORIGIN?.trim();

  const missing: string[] = [];
  if (!mongodbUri) missing.push('MONGODB_URI');
  if (isProduction && !rawOrigins) missing.push('CLIENT_ORIGIN');
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. See server/.env.example.`,
    );
  }

  const rawPort = env.PORT?.trim() || '4000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535 (received "${rawPort}").`);
  }

  const clientOrigins = (rawOrigins || DEFAULT_DEV_ORIGIN)
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);

  return { port, nodeEnv, isProduction, mongodbUri: mongodbUri as string, clientOrigins };
}
