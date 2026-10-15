/**
 * Renders every on-map ad slot and the District Founding Partner gates.
 * Panels are tappable (tracked); empty ones invite businesses to advertise.
 * Only the current district's slots and gate are mounted (nothing at island
 * zoom): they're too small to read from far away and it keeps draw calls low
 * on phones. Impressions: a slot counts as seen once per session when the
 * player is in its district, which keeps tracking cheap.
 */
import { useEffect, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { api } from '@/api';
import { useAdsStore } from '@/store/useAdsStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useUiStore } from '@/store/useUiStore';
import { translate } from '@/i18n';
import { DISTRICTS } from '@/data/districts';
import { flyToBusiness } from '@/lib/navigation';
import { ADVERTISE_URL, type AdPlacement } from '@/types/ads';
import type { District } from '@/types/geo';
import { GEO, GOLD, lambert } from '../buildings/kit';
import { creativeTexture } from './creativeTexture';
import { districtEntrances, resolveSpot } from './placement';

const POST = lambert('#475569');
const FRAME = lambert('#e2e8f0');
const isTap = (e: ThreeEvent<MouseEvent>) => e.delta < 8;
/** Ads are drawn bigger in the toy-city scale. */
const AD_SCALE = 1.25;

/** A creative panel visible from both sides. */
function Panel({ w, h, texture, onTap }: { w: number; h: number; texture: THREE.Texture; onTap: () => void }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]);
  const handle = (e: ThreeEvent<MouseEvent>) => {
    if (!isTap(e)) return;
    e.stopPropagation();
    onTap();
  };
  return (
    <group>
      <mesh geometry={GEO.box} material={FRAME} scale={[w + 0.03, h + 0.03, 0.015]} />
      <mesh geometry={GEO.plane} material={mat} scale={[w, h, 1]} position-z={0.009} onClick={handle} />
      <mesh geometry={GEO.plane} material={mat} scale={[w, h, 1]} position-z={-0.009} rotation-y={Math.PI} onClick={handle} />
    </group>
  );
}

function useEmptyLabels() {
  const locale = useUiStore((s) => s.locale);
  return { label: translate(locale, 'ads.here'), sub: 'heapspark.com/advertise' };
}

function Billboard({ p, w = 0.56, h = 0.28, legs = 0.2 }: { p: AdPlacement; w?: number; h?: number; legs?: number }) {
  const spot = useMemo(() => resolveSpot(p.slot.placement), [p.slot.placement]);
  const empty = useEmptyLabels();
  const tex = creativeTexture(p.booking?.creative ?? null, w / h, empty.label, empty.sub);
  const click = useAdsStore((s) => s.click);
  if (!spot) return null;
  return (
    <group position={spot.position} rotation-y={spot.rotation} scale={AD_SCALE} name={`ad-${p.slot.id}`}>
      {[-w * 0.3, w * 0.3].map((x) => (
        <mesh key={x} geometry={GEO.box} material={POST} position={[x, legs / 2, 0]} scale={[0.02, legs + 0.05, 0.02]} />
      ))}
      <group position-y={legs + h / 2} name={`ad-panel-${p.slot.id}`}>
        <Panel w={w} h={h} texture={tex} onTap={() => click(p)} />
      </group>
    </group>
  );
}

/** Welcome-to-town sign: town name on top, ad panel below. */
function TownEntrance({ p }: { p: AdPlacement }) {
  return <Billboard p={p} w={0.42} h={0.21} legs={0.14} />;
}

/** Small bus shelter with a poster on the side. */
function BusStop({ p }: { p: AdPlacement }) {
  const spot = useMemo(() => resolveSpot(p.slot.placement, 0.45, 0.3), [p.slot.placement]);
  const empty = useEmptyLabels();
  const tex = creativeTexture(p.booking?.creative ?? null, 0.75, empty.label, empty.sub);
  const click = useAdsStore((s) => s.click);
  if (!spot) return null;
  return (
    <group position={spot.position} rotation-y={spot.rotation} scale={AD_SCALE} name={`ad-${p.slot.id}`}>
      <mesh geometry={GEO.box} material={lambert('#0ea5b7')} position={[0, 0.09, 0]} scale={[0.16, 0.012, 0.07]} />
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} geometry={GEO.box} material={POST} position={[x, 0.045, -0.03]} scale={[0.008, 0.09, 0.008]} />
      ))}
      <mesh geometry={GEO.box} material={lambert('#cbd5e1')} position={[0, 0.02, -0.02]} scale={[0.12, 0.01, 0.025]} />
      <group position={[0.1, 0.07, 0]} rotation-y={-Math.PI / 2}>
        <Panel w={0.075} h={0.1} texture={tex} onTap={() => click(p)} />
      </group>
    </group>
  );
}

/** Big banner beside the airport terminal — "the first thing players see". */
function AirportBanner({ p }: { p: AdPlacement }) {
  return <Billboard p={p} w={0.95} h={0.3} legs={0.1} />;
}

/** Gateway over the road into a district, carrying its Founding Partner. */
function DistrictGate({ district }: { district: District }) {
  const spot = districtEntrances()[district.id];
  const partner = useAdsStore((s) => s.partners.find((p) => p.type === 'districtFounding' && p.districtId === district.id));
  const locale = useUiStore((s) => s.locale);
  const tex = creativeTexture(
    partner
      ? { kind: 'text', headline: partner.businessName, sub: `${translate(locale, 'partner.district')} · ${district.name}`, bg: partner.brandColor }
      : null,
    3.6,
    `Bienvini dan ${district.name}`,
    translate(locale, 'partner.slotOpen'),
  );
  if (!spot) return null;
  const angle = Math.atan2(spot.tangent[0], spot.tangent[1]);
  const span = 0.62;
  const tap = () => {
    if (partner) void flyToBusiness(partner.businessId);
    else window.open(ADVERTISE_URL, '_blank', 'noopener');
  };
  return (
    <group position={spot.position} rotation-y={angle} scale={AD_SCALE} name={`gate-${district.id}`}>
      {[-span / 2, span / 2].map((x) => (
        <group key={x} position-x={x}>
          <mesh geometry={GEO.box} material={partner ? GOLD : FRAME} position-y={0.2} scale={[0.05, 0.4, 0.05]} />
          <mesh geometry={GEO.box} material={lambert(district.color)} position-y={0.42} scale={[0.07, 0.04, 0.07]} />
        </group>
      ))}
      <mesh geometry={GEO.box} material={lambert(district.color)} position-y={0.36} scale={[span + 0.08, 0.035, 0.04]} />
      <group position-y={0.27}>
        <Panel w={span - 0.08} h={(span - 0.08) / 3.6} texture={tex} onTap={tap} />
      </group>
    </group>
  );
}

export function AdLayer() {
  const placements = useAdsStore((s) => s.placements);
  const districtId = useCameraStore((s) => s.districtId);
  const level = useCameraStore((s) => s.level);

  // Impressions for the district the player is looking at.
  useEffect(() => {
    if (level === 'island' || !districtId) return;
    for (const p of placements) if (p.slot.districtId === districtId && p.slot.placement.kind !== 'screen') api.ads.trackImpression(p.slot.id);
  }, [placements, districtId, level]);

  if (level === 'island' || !districtId) return null;
  const local = placements.filter((p) => p.slot.districtId === districtId);
  const district = DISTRICTS.find((d) => d.id === districtId)!;

  return (
    <group name="ads">
      {local.map((p) => {
        switch (p.slot.type) {
          case 'billboard':
            return <Billboard key={p.slot.id} p={p} />;
          case 'townEntrance':
            return <TownEntrance key={p.slot.id} p={p} />;
          case 'busStop':
            return <BusStop key={p.slot.id} p={p} />;
          case 'airportBanner':
            return <AirportBanner key={p.slot.id} p={p} />;
          default:
            return null;
        }
      })}
      <DistrictGate district={district} />
    </group>
  );
}
