/**
 * Picks the data adapter from `VITE_API` ("mock" by default). The Supabase
 * adapter will be added here later and loaded lazily so mock users never
 * download the Supabase client.
 */
import { mockApi } from './mock';
import type { HeapsparkApi } from './types';

const adapter = import.meta.env.VITE_API ?? 'mock';
if (adapter !== 'mock') {
  console.warn(`[api] Adapter "${adapter}" is not available yet — falling back to mock data.`);
}

export const api: HeapsparkApi = mockApi;
export type { HeapsparkApi, WorldData } from './types';
