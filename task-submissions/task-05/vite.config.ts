import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `base: './'` makes every asset URL relative, so the built site works when it is served from a
// sub-folder (for example https://user.github.io/repo/task-submissions/task-05/dist/).
// Navigation uses hash URLs (#/projects), so no server-side route rewriting is needed.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
