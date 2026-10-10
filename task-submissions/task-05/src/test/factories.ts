import type { ChangeRequest, Project } from '../types';

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Test Project',
    clientName: 'Test Client',
    description: 'A project used in tests.',
    currency: 'USD',
    originalBudget: 10000,
    originalEndDate: '2026-12-01',
    status: 'active',
    scopeItems: [{ id: 's1', title: 'Homepage', description: '' }],
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeChange(overrides: Partial<ChangeRequest> = {}): ChangeRequest {
  return {
    id: 'c1',
    projectId: 'p1',
    title: 'Test change',
    description: 'A change used in tests.',
    costAdjustment: 500,
    scheduleImpactDays: 3,
    status: 'pending_review',
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    ...overrides,
  };
}
