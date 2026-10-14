/**
 * Mock adapter: serves the seed data bundled in `src/data`. Runs entirely
 * in the browser so the game works offline and without a backend.
 */
import { DISTRICTS } from '@/data/districts';
import { TOWNS } from '@/data/towns';
import { LANDMARKS } from '@/data/landmarks';
import type { HeapsparkApi } from '../types';

export const mockApi: HeapsparkApi = {
  geo: {
    async getWorld() {
      return { districts: DISTRICTS, towns: TOWNS, landmarks: LANDMARKS };
    },
  },
};
