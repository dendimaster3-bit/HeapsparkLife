/**
 * Keeps client caches fresh when data changes (an approval in /admin, a
 * redemption on /validate in another tab…). The mock adapter fires on every
 * save; the Supabase adapter will fire from realtime subscriptions.
 */
import { api } from '@/api';
import { useWorldStore } from '@/store/useWorldStore';
import { useAdsStore } from '@/store/useAdsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSearchStore } from '@/store/useSearchStore';
import { clearBusinessDetailCache } from '@/ui/card/useBusinessDetail';

let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export function startLiveData() {
  if (started) return;
  started = true;
  api.subscribe(() => {
    // Coalesce bursts of saves into one refresh.
    clearTimeout(timer);
    timer = setTimeout(() => {
      clearBusinessDetailCache();
      void useWorldStore.getState().reloadLoaded();
      void useAdsStore.getState().reload();
      if (useSessionStore.getState().session) void useSessionStore.getState().refreshWallet();
      if (useSearchStore.getState().open) void useSearchStore.getState().run();
    }, 150);
  });
}
