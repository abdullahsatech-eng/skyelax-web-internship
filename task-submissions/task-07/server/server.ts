import { createApp } from './app';
import { loadConfig, type AppConfig } from './config';
import { connectDatabase, disconnectDatabase, redactSecrets } from './db/connection';

async function main(): Promise<void> {
  let config: AppConfig;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  try {
    await connectDatabase(config.mongodbUri, config.mongodbDatabase);
  } catch (err) {
    console.error('Could not connect to MongoDB:', redactSecrets(err instanceof Error ? err.message : String(err)));
    console.error('See "Troubleshooting" in README.md (check the connection string, database user and Atlas network access).');
    process.exit(1);
  }
  console.log(`Connected to database "${config.mongodbDatabase}".`);

  const server = createApp().listen(config.port, () => {
    console.log(`StockDesk API listening on http://localhost:${config.port}`);
  });

  const shutdown = (): void => {
    server.close(() => {
      disconnectDatabase().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void main();
