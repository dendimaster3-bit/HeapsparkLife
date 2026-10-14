/**
 * Camera / navigation state. UI and 3D code request moves through these
 * actions; `game/camera/CameraRig.tsx` animates the actual camera.
 */
import { create } from 'zustand';
import type { DistrictId, ZoomLevel } from '@/types/geo';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS_BY_ID } from '@/data/towns';
import { ISLAND_BOUNDS, groundPoint } from '@/lib/geo';

export interface CameraTarget {
  /** Point the camera looks at. */
  look: [number, number, number];
  /** Distance from the look point (km). */
  distance: number;
  /** Polar angle from vertical in radians (0 = top-down). */
  polar: number;
}

/** Island overview: whole island in frame, slightly tilted. */
export const ISLAND_VIEW: CameraTarget = {
  look: [(ISLAND_BOUNDS.minX + ISLAND_BOUNDS.maxX) / 2, 0, (ISLAND_BOUNDS.minZ + ISLAND_BOUNDS.maxZ) / 2 + 3],
  distance: 95,
  polar: 0.62,
};
const TOWN_DISTANCE = 4.5;
const BUSINESS_DISTANCE = 1.7;

/** Distances where manual zooming switches levels. */
export const LEVEL_THRESHOLDS = { island: 45, district: 12, town: 3.5 } as const;

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
  goBusiness(id: string, townId: string, look: [number, number, number]): void;
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
    const d = DISTRICTS_BY_ID[id];
    set((s) => ({
      level: 'district',
      districtId: id,
      townId: null,
      businessId: null,
      target: { look: groundPoint(d.center), distance: d.zoomDistance, polar: 0.75 },
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
      target: { look: groundPoint(t.at), distance: TOWN_DISTANCE, polar: 0.9 },
      requestId: s.requestId + 1,
    }));
  },

  goBusiness: (id, townId, look) => {
    const t = TOWNS_BY_ID[townId];
    set((s) => ({
      level: 'business',
      districtId: t?.districtId ?? s.districtId,
      townId,
      businessId: id,
      target: { look, distance: BUSINESS_DISTANCE, polar: 0.9 },
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

    const nextDistrict = next === 'island' ? null : under ?? districtId;
    const nextTown = next === 'town' || next === 'business' ? nearTown ?? townId : null;
    const nextBusiness = next === 'business' ? businessId : null;
    if (next !== level || nextDistrict !== districtId || nextTown !== townId || nextBusiness !== businessId) {
      set({ level: next, districtId: nextDistrict, townId: nextTown, businessId: nextBusiness });
    }
  },
}));
