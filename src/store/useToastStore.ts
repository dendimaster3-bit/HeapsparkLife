/** Small, auto-dismissing notifications (points earned, stamps, badges). */
import { create } from 'zustand';

export interface Toast {
  id: number;
  icon: string;
  title: string;
  body?: string;
  /** Optional accent colour (e.g. the district colour for stamps). */
  color?: string;
}

interface ToastState {
  toasts: Toast[];
  push(t: Omit<Toast, 'id'>): void;
  dismiss(id: number): void;
}

let next = 1;
const MAX = 3;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = next++;
    set({ toasts: [...get().toasts, { ...t, id }].slice(-MAX) });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
