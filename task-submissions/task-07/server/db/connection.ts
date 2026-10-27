import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';

/** Removes anything that looks like a connection string before text is logged. */
export function redactSecrets(text: string): string {
  return text.replace(/mongodb(\+srv)?:\/\/[^\s'"]+/gi, 'mongodb://<redacted>');
}

/**
 * Connects once, proves the server answers a ping, then makes sure the collections and
 * unique indexes exist. Mongoose keeps a connection pool, so this is called once per process.
 */
export async function connectDatabase(uri: string, dbName: string): Promise<void> {
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10_000 });

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database handle is unavailable after connecting.');
  await db.command({ ping: 1 });

  await Promise.all([Category.init(), Supplier.init(), Product.init()]);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
