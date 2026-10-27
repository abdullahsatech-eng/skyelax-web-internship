import { loadConfig } from '../config';
import { connectDatabase, disconnectDatabase, redactSecrets } from '../db/connection';
import { seedReferenceData } from '../db/seedReferenceData';

/** `npm run db:setup` - creates indexes (via connect) and adds missing reference data. */
async function main(): Promise<void> {
  const config = loadConfig();
  await connectDatabase(config.mongodbUri, config.mongodbDatabase);
  console.log(`Connected to "${config.mongodbDatabase}". Collections and indexes are in place.`);

  const result = await seedReferenceData();
  console.log(
    `Reference data: ${result.categoriesCreated} categories and ${result.suppliersCreated} suppliers added (existing records were left unchanged).`,
  );
  await disconnectDatabase();
}

main().catch((err: unknown) => {
  console.error('Setup failed:', redactSecrets(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
