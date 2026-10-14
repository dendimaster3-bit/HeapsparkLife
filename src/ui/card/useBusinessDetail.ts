/** Loads (and caches) the business-card data for a business id. */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { BusinessDetail } from '@/types/business';

const cache = new Map<string, BusinessDetail | null>();

export function useBusinessDetail(id: string | null) {
  const [detail, setDetail] = useState<BusinessDetail | null | undefined>(id ? cache.get(id) : null);
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
  }, [id]);
  /** undefined = loading, null = not found. */
  return detail;
}
