/**
 * Signed-in player + wallet. Also coordinates the sign-in sheet: an action
 * that needs an account (e.g. unlocking a promo) calls `requireAuth`, which
 * opens the sheet and runs the action once the player has signed in.
 */
import { create } from 'zustand';
import { api } from '@/api';
import type { Session } from '@/types/player';
import type { WalletItem } from '@/types/promo';

interface SessionState {
  session: Session | null;
  ready: boolean;
  wallet: WalletItem[];
  /** Sign-in sheet visibility + the action waiting for it. */
  authOpen: boolean;
  pending: (() => void) | null;
  /** Wallet sheet + the code currently shown full-screen. */
  walletOpen: boolean;
  shownCode: WalletItem | null;

  init(): Promise<void>;
  requireAuth(action: () => void): void;
  closeAuth(): void;
  signedIn(session: Session): void;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  refreshWallet(): Promise<void>;
  setWalletOpen(open: boolean): void;
  showCode(item: WalletItem | null): void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  ready: false,
  wallet: [],
  authOpen: false,
  pending: null,
  walletOpen: false,
  shownCode: null,

  init: async () => {
    const session = await api.auth.getSession();
    set({ session, ready: true });
    if (session) await get().refreshWallet();
  },
  requireAuth: (action) => {
    if (get().session) action();
    else set({ authOpen: true, pending: action });
  },
  closeAuth: () => set({ authOpen: false, pending: null }),
  signedIn: (session) => {
    const pending = get().pending;
    set({ session, authOpen: false, pending: null });
    void get().refreshWallet();
    pending?.();
  },
  signOut: async () => {
    await api.auth.signOut();
    set({ session: null, wallet: [], walletOpen: false, shownCode: null });
  },
  deleteAccount: async () => {
    await api.auth.deleteAccount();
    set({ session: null, wallet: [], walletOpen: false, shownCode: null });
  },
  refreshWallet: async () => set({ wallet: await api.promos.wallet() }),
  setWalletOpen: (walletOpen) => {
    set({ walletOpen });
    if (walletOpen) void get().refreshWallet();
  },
  showCode: (shownCode) => set({ shownCode }),
}));
