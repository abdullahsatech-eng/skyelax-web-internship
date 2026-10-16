import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on('error', (error) => {
    console.error('[database] connection error:', error.name);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[database] disconnected');
  });
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

/** True only when the connection is open and the server answers a ping. */
export async function checkDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState !== 1) return false;
  await mongoose.connection.db?.admin().ping();
  return true;
}
