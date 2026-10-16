import type { Express } from 'express';
import { createApp } from '../../src/app';
import type { RequestRepository } from '../../src/services/requestRepository';
import { InMemoryRequestRepository } from './inMemoryRepository';

export const TEST_ORIGIN = 'http://localhost:5173';

export function buildTestApp(
  options: { repository?: RequestRepository; databaseUp?: boolean | (() => Promise<boolean>) } = {},
): Express {
  const databaseUp = options.databaseUp ?? true;
  return createApp({
    requestRepository: options.repository ?? new InMemoryRequestRepository(),
    checkDatabase: typeof databaseUp === 'function' ? databaseUp : async () => databaseUp,
    corsOrigins: [TEST_ORIGIN],
    logErrors: false, // keep test output clean
  });
}

export const validPayload = {
  title: 'Projector will not turn on',
  description: 'The projector in meeting room B shows no signal.',
  category: 'it',
  priority: 'high',
  requesterName: 'Demo Requester',
  requesterEmail: 'Demo.Requester@Example.com',
};

export const NONEXISTENT_ID = '000000000000000000000000';
