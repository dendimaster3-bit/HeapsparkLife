/**
 * Camera / navigation state. UI and 3D code request moves through these
 * actions; `game/camera/CameraRig.tsx` animates the actual camera.
 */
import { create } from 'zustand';
import type { DistrictId, ZoomLevel } from '@/types/geo';
import { TOWNS, TOWNS_BY_ID } from '@/data/towns';
import { BOARD_TOP, DISTRICT_BOUNDS, ISLAND_BOUNDS, groundPoint } from '@/lib/geo';

export interface CameraTarget {
  /** Point the camera looks at. */
  look: [number, number, number];
  /** Distance from the look point (km). */
  distance: number;
  /** Polar angle from vertical in radians (0 = top-down). */
  polar: number;
  /** Compass heading to view from (radians); omitted = keep the current one. */
  azimuth?: number;
}

/** Island overview: whole island in frame, slightly tilted. */
/** Island overview: the district map seen almost from above (like a paper map). */
export const ISLAND_VIEW: CameraTarget = {
  look: [(ISLAND_BOUNDS.minX + ISLAND_BOUNDS.maxX) / 2, 0, (ISLAND_BOUNDS.minZ + ISLAND_BOUNDS.maxZ) / 2 + 5],
  distance: 78,
  polar: 0.22,
  azimuth: 0,
};

const KIND_RANK = { city: 0, town: 1, village: 2 } as const;

/**
 * Camera framing for an opened district: a tilted "toy city" view centred
 * on its main town (the player pans to see the rest).
 */
export function districtView(id: DistrictId): CameraTarget {
  const main = [...TOWNS].filter((t) => t.districtId === id).sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind])[0];
  const b = DISTRICT_BOUNDS[id];
  const look = main ? groundPoint(main.at) : ([(b.minX + b.maxX) / 2, BOARD_TOP, (b.minZ + b.maxZ) / 2] as [number, number, number]);
  return { look, distance: 11, polar: 0.85 };
}
const TOWN_DISTANCE = 5;
const BUSINESS_DISTANCE = 2.4;

/** Distances where manual zooming switches levels. */
export const LEVEL_THRESHOLDS = { island: 45, district: 7.5, town: 3.8 } as const;

interface CameraState {
  level: ZoomLevel;
  districtId: DistrictId | null;
  townId: string | null;
  /** Selected business (level 'business'). */
  businessId: string | null;
  target: CameraTarget;
  /** Bumped on every programmatic move so the rig knows to animate. */
  requestId: number;

  goIsland(): void;
  goDistrict(id: DistrictId): void;
  goTown(id: string): void;
  /** Focus a business building at a world position. */
  goBusiness(id: string, townId: string, look: [number, number, number], facing?: number): void;
  /** One step back up the zoom hierarchy. */
  goBack(): void;
  /** Called by the rig when the camera settles after the player pans/zooms. */
  syncFromControls(distance: number, districtUnderCamera: DistrictId | null, townNearCamera: string | null): void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  level: 'island',
  districtId: null,
  townId: null,
  businessId: null,
  target: ISLAND_VIEW,
  requestId: 0,

  goIsland: () =>
    set((s) => ({ level: 'island', districtId: null, townId: null, businessId: null, target: ISLAND_VIEW, requestId: s.requestId + 1 })),

  goDistrict: (id) => {
    set((s) => ({
      level: 'district',
      districtId: id,
      townId: null,
      businessId: null,
      target: districtView(id),
      requestId: s.requestId + 1,
    }));
  },

  goTown: (id) => {
    const t = TOWNS_BY_ID[id];
    if (!t) return;
    set((s) => ({
      level: 'town',
      districtId: t.districtId,
      townId: id,
      businessId: null,
      target: { look: groundPoint(t.at), distance: TOWN_DISTANCE, polar: 0.92 },
      requestId: s.requestId + 1,
    }));
  },

  goBusiness: (id, townId, look, facing) => {
    const t = TOWNS_BY_ID[townId];
    set((s) => ({
      level: 'business',
      districtId: t?.districtId ?? s.districtId,
      townId,
      businessId: id,
      // View the shop front at a friendly 3/4 angle.
      target: { look, distance: BUSINESS_DISTANCE, polar: 0.9, azimuth: facing === undefined ? undefined : facing + 0.45 },
      requestId: s.requestId + 1,
    }));
  },

  goBack: () => {
    const { level, districtId, townId } = get();
    if (level === 'business' && townId) get().goTown(townId);
    else if (level === 'town' && districtId) get().goDistrict(districtId);
    else get().goIsland();
  },

  syncFromControls: (distance, under, nearTown) => {
    const { level, districtId, townId, businessId } = get();
    // Derive the level from how far the player has zoomed.
    let next: ZoomLevel = level;
    if (distance > LEVEL_THRESHOLDS.island) next = 'island';
    else if (distance > LEVEL_THRESHOLDS.district) next = 'district';
    else if (level !== 'business' || distance > LEVEL_THRESHOLDS.town) next = 'town';

    // While a district is open it stays open (panning is limited to it);
    // only zooming far out returns to the island map.
    const nextDistrict = next === 'island' ? null : districtId ?? under;
    const nextTown = next === 'town' || next === 'business' ? nearTown ?? townId : null;
    const nextBusiness = next === 'business' ? businessId : null;
    if (next !== level || nextDistrict !== districtId || nextTown !== townId || nextBusiness !== businessId) {
      set({ level: next, districtId: nextDistrict, townId: nextTown, businessId: nextBusiness });
    }
  },
}));
