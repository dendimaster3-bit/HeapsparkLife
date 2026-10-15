/**
 * Places plots and member buildings on the map for every loaded district,
 * and asks the API for a district's content when the player enters it
 * (districts are loaded lazily, then kept).
 */
import { useEffect } from 'react';
import { api } from '@/api';
import { useSearchStore } from '@/store/useSearchStore';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useCameraStore } from '@/store/useCameraStore';
import { useWorldStore } from '@/store/useWorldStore';
import { nightFactor } from '@/store/useClockStore';
import { SUBCATEGORIES_BY_ID } from '@/data/categories';
import { heightAt } from '@/lib/geo';
import type { MapBusiness, Plot } from '@/types/business';
import type { DistrictId } from '@/types/geo';
import { GEO, KIT_SCALE, WINDOW_OPEN } from './kit';
import { Building, useBuildingSpec } from './Building';
import { UnclaimedPlots } from './UnclaimedPlots';
import { useIsOpen } from './useIsOpen';
import { SHADOW_MATERIAL } from '../world/Neighbourhoods';
import * as THREE from 'three';

const SHADOW_GEO = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/** Ignore "clicks" that were really drags of the map. */
const isTap = (e: ThreeEvent<MouseEvent>) => e.delta < 8;

function BusinessBuilding({ business, plot, label }: { business: MapBusiness; plot: Plot; label: boolean }) {
  const sub = SUBCATEGORIES_BY_ID[business.subcategoryId];
  const styleId = sub?.styleId ?? 'retail';
  const base = business.baseOverride ?? sub?.base;
  const open = useIsOpen(business.hours);
  const selected = useCameraStore((s) => s.businessId === business.id);
  const pinned = useSearchStore((s) => s.highlight.includes(business.id));
  const goBusiness = useCameraStore((s) => s.goBusiness);
  const { spec } = useBuildingSpec({ styleId, base });
  // Founding Members and both kinds of Founding Partner get the gold skin;
  // District Founding Partners also become a landmark.
  const landmark = !!business.partner.district;
  const gold = business.isFoundingMember || landmark || !!business.partner.subcategory;

  const [x, z] = plot.position;
  const y = heightAt(x, z);
  const select = (e: ThreeEvent<MouseEvent>) => {
    if (!isTap(e)) return;
    e.stopPropagation();
    goBusiness(business.id, business.townId, [x, y + 0.08, z], plot.rotation);
  };

  return (
    <group position={[x, y, z]} rotation-y={plot.rotation} scale={KIT_SCALE * (landmark ? 1.35 : 1)} name={business.id}>
      <Building
        name={business.name}
        brand={business.brandColor}
        logoUrl={business.logoUrl}
        styleId={styleId}
        base={base}
        open={open}
        promo={business.activePromoCount > 0}
        level={business.growthLevel}
        gold={gold}
        landmark={landmark}
        selected={selected}
        pinned={pinned}
        emblem={sub?.icon}
      />
      {label && !selected && (
        <Html position={[0, spec.top * 1.25 + 3.4, 0]} center zIndexRange={[16, 0]}>
          <button
            onClick={() => goBusiness(business.id, business.townId, [x, y + 0.08, z], plot.rotation)}
            className="pointer-events-auto flex max-w-44 items-center gap-1 whitespace-nowrap rounded-full border-2 bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-md active:scale-95 dark:bg-slate-900/95 dark:text-slate-100"
            style={{ borderColor: business.brandColor }}
          >
            <span aria-hidden>{sub?.icon}</span>
            <span className="truncate">{business.name}</span>
            {business.activePromoCount > 0 && <span aria-hidden>✨</span>}
          </button>
        </Html>
      )}
      {/* Soft contact shadow */}
      <mesh geometry={SHADOW_GEO} material={SHADOW_MATERIAL} position={[0.6, 0.05, 0.5]} scale={[spec.w * 2.6 + 2, 1, spec.d * 2.6 + 2]} renderOrder={1} />
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

/** Businesses + unclaimed plots of one (open) district. */
export function BusinessLayer({ districtId }: { districtId: DistrictId }) {
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

  const content = districts[districtId];
  if (!content) return null;
  const unclaimed = content.plots.filter((p) => !p.businessId);

  return (
    <group name="businesses">
      {content.businesses.map((b) => {
        const plot = content.plots.find((p) => p.id === b.plotId);
        if (!plot) {
          console.warn(`[map] ${b.id}: plot ${b.plotId} not found`);
          return null;
        }
        // Name chips only when zoomed on a town (district view shows town names instead).
        return <BusinessBuilding key={b.id} business={b} plot={plot} label={level === 'town' && b.townId === townId} />;
      })}
      <UnclaimedPlots plots={unclaimed} />
    </group>
  );
}
