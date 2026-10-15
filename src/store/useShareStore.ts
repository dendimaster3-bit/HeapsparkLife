/** What's being shared right now (opens the share sheet). */
import { create } from 'zustand';
import type { ShareCardInput } from '@/lib/shareCard';

export interface SharePayload {
  card: ShareCardInput;
  /** Message text for WhatsApp / native share. */
  text: string;
  url: string;
  /** For share tracking in business stats. */
  businessId?: string;
}

export const useShareStore = create<{ payload: SharePayload | null; open(p: SharePayload): void; close(): void }>((set) => ({
  payload: null,
  open: (payload) => set({ payload }),
  close: () => set({ payload: null }),
}));
