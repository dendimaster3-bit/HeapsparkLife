/**
 * Higher-level camera moves that need data (e.g. a business's plot), used
 * by search results and the card.
 */
import { api } from '@/api';
import { useCameraStore } from '@/store/useCameraStore';
import { useWorldStore } from '@/store/useWorldStore';
import { heightAt } from '@/lib/geo';
import type { DistrictId } from '@/types/geo';

/** Load the business's district (if needed) and fly to its building. */
export async function flyToBusiness(id: string) {
  const detail = await api.directory.getBusiness(id);
  if (!detail) return;
  const { business, plot } = detail;
  await useWorldStore.getState().loadDistrict(business.districtId);
  const [x, z] = plot.position;
  useCameraStore.getState().goBusiness(business.id, business.townId, [x, heightAt(x, z) + 0.08, z], plot.rotation);
}

/**
 * Frame a set of results: one town → that town, one district → that
 * district, otherwise the whole island. Loads every district involved.
 */
export async function frameResults(items: { districtId: DistrictId; townId: string }[]) {
  if (!items.length) return;
  const districts = [...new Set(items.map((i) => i.districtId))];
  await Promise.all(districts.map((d) => useWorldStore.getState().loadDistrict(d)));
  const towns = new Set(items.map((i) => i.townId));
  const cam = useCameraStore.getState();
  if (towns.size === 1) cam.goTown(items[0].townId);
  else if (districts.length === 1) cam.goDistrict(districts[0]);
  else cam.goIsland();
}
