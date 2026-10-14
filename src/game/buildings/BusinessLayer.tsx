/**
 * Places plots and member buildings on the map for every loaded district,
 * and asks the API for a district's content when the player enters it
 * (districts are loaded lazily, then kept).
 */
import { useEffect } from 'react';
import { api } from '@/api';
import { useSearchStore } from '@/store/useSearchStore';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useCameraStore } from '@/store/useCameraStore';
import { useWorldStore } from '@/store/useWorldStore';
import { nightFactor } from '@/store/useClockStore';
import { SUBCATEGORIES_BY_ID } from '@/data/categories';
import { heightAt } from '@/lib/geo';
import type { MapBusiness, Plot } from '@/types/business';
import { GEO, KIT_SCALE, WINDOW_OPEN } from './kit';
import { Building, useBuildingSpec } from './Building';
import { UnclaimedPlots } from './UnclaimedPlots';
import { useIsOpen } from './useIsOpen';

/** Ignore "clicks" that were really drags of the map. */
const isTap = (e: ThreeEvent<MouseEvent>) => e.delta < 8;

function BusinessBuilding({ business, plot }: { business: MapBusiness; plot: Plot }) {
  const sub = SUBCATEGORIES_BY_ID[business.subcategoryId];
  const styleId = sub?.styleId ?? 'retail';
  const base = business.baseOverride ?? sub?.base;
  const open = useIsOpen(business.hours);
  const selected = useCameraStore((s) => s.businessId === business.id);
  const pinned = useSearchStore((s) => s.highlight.includes(business.id));
  const goBusiness = useCameraStore((s) => s.goBusiness);
  const { spec } = useBuildingSpec({ styleId, base });

  const [x, z] = plot.position;
  const y = heightAt(x, z);
  const select = (e: ThreeEvent<MouseEvent>) => {
    if (!isTap(e)) return;
    e.stopPropagation();
    goBusiness(business.id, business.townId, [x, y + 0.08, z], plot.rotation);
  };

  return (
    <group position={[x, y, z]} rotation-y={plot.rotation} scale={KIT_SCALE} name={business.id}>
      <Building
        name={business.name}
        brand={business.brandColor}
        logoUrl={business.logoUrl}
        styleId={styleId}
        base={base}
        open={open}
        promo={business.activePromoCount > 0}
        level={business.growthLevel}
        gold={business.isFoundingMember}
        selected={selected}
        pinned={pinned}
      />
      {/* Invisible hit box: cheap, reliable tap target covering building + prop. */}
      <mesh
        geometry={GEO.box}
        position={[0.8, spec.top / 2, 0]}
        scale={[spec.w + 2.6, spec.top + 0.6, spec.d + 1.2]}
        visible={false}
        onClick={select}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      />
    </group>
  );
}

/** Businesses already counted as "viewed" this session. */
const viewed = new Set<string>();

export function BusinessLayer() {
  const districtId = useCameraStore((s) => s.districtId);
  const level = useCameraStore((s) => s.level);
  const townId = useCameraStore((s) => s.townId);
  const loadDistrict = useWorldStore((s) => s.loadDistrict);
  const districts = useWorldStore((s) => s.districts);

  useEffect(() => {
    if (districtId) void loadDistrict(districtId);
  }, [districtId, loadDistrict]);

  // A "view" = the building was on screen at town zoom (once per session).
  useEffect(() => {
    if ((level !== 'town' && level !== 'business') || !townId || !districtId) return;
    for (const b of districts[districtId]?.businesses ?? []) {
      if (b.townId === townId && !viewed.has(b.id)) {
        viewed.add(b.id);
        api.events.track('view', b.id);
      }
    }
  }, [level, townId, districtId, districts]);

  // Shop windows glow brighter after dark (one shared material).
  useFrame(() => {
    WINDOW_OPEN.emissiveIntensity = 0.25 + nightFactor() * 1.1;
  });

  const loaded = Object.values(districts).filter(Boolean);
  const unclaimed = loaded.flatMap((d) => d!.plots.filter((p) => !p.businessId));

  return (
    <group name="businesses">
      {loaded.flatMap((d) =>
        d!.businesses.map((b) => {
          const plot = d!.plots.find((p) => p.id === b.plotId);
          if (!plot) {
            console.warn(`[map] ${b.id}: plot ${b.plotId} not found`);
            return null;
          }
          return <BusinessBuilding key={b.id} business={b} plot={plot} />;
        }),
      )}
      <UnclaimedPlots plots={unclaimed} />
    </group>
  );
}
