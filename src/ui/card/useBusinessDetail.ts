/** Loads (and caches) the business-card data for a business id. */
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api';
import type { BusinessDetail } from '@/types/business';

const cache = new Map<string, BusinessDetail | null>();

export function useBusinessDetail(id: string | null) {
  const [detail, setDetail] = useState<BusinessDetail | null | undefined>(id ? cache.get(id) : null);
  const [version, setVersion] = useState(0);
  /** Drop the cached copy and refetch (e.g. after a promo unlock). */
  const refresh = useCallback(() => {
    if (id) cache.delete(id);
    setVersion((v) => v + 1);
  }, [id]);
  useEffect(() => {
    if (!id) return setDetail(null);
    if (cache.has(id)) return setDetail(cache.get(id));
    let alive = true;
    setDetail(undefined);
    void api.directory.getBusiness(id).then((d) => {
      cache.set(id, d);
      if (alive) setDetail(d);
    });
    return () => {
      alive = false;
    };
  }, [id, version]);
  /** detail: undefined = loading, null = not found. */
  return [detail, refresh] as const;
}
