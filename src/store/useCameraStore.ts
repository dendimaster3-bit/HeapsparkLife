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

/** Distances where manual zooming switches levels. */
export const LEVEL_THRESHOLDS = { island: 45, district: 12 } as const;

interface CameraState {
  level: ZoomLevel;
  districtId: DistrictId | null;
  townId: string | null;
  target: CameraTarget;
  /** Bumped on every programmatic move so the rig knows to animate. */
  requestId: number;

  goIsland(): void;
  goDistrict(id: DistrictId): void;
  goTown(id: string): void;
  /** One step back up the zoom hierarchy. */
  goBack(): void;
  /** Called by the rig when the camera settles after the player pans/zooms. */
  syncFromControls(distance: number, districtUnderCamera: DistrictId | null, townNearCamera: string | null): void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  level: 'island',
  districtId: null,
  townId: null,
  target: ISLAND_VIEW,
  requestId: 0,

  goIsland: () =>
    set((s) => ({ level: 'island', districtId: null, townId: null, target: ISLAND_VIEW, requestId: s.requestId + 1 })),

  goDistrict: (id) => {
    const d = DISTRICTS_BY_ID[id];
    set((s) => ({
      level: 'district',
      districtId: id,
      townId: null,
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
      target: { look: groundPoint(t.at), distance: TOWN_DISTANCE, polar: 0.9 },
      requestId: s.requestId + 1,
    }));
  },

  goBack: () => {
    const { level, districtId } = get();
    if ((level === 'town' || level === 'business') && districtId) get().goDistrict(districtId);
    else get().goIsland();
  },

  syncFromControls: (distance, under, nearTown) => {
    const { level, districtId, townId } = get();
    // Derive the level from how far the player has zoomed.
    let next: ZoomLevel = level;
    if (distance > LEVEL_THRESHOLDS.island) next = 'island';
    else if (distance > LEVEL_THRESHOLDS.district) next = 'district';
    else if (level === 'island' || level === 'district') next = 'town';

    const nextDistrict = next === 'island' ? null : under ?? districtId;
    const nextTown = next === 'town' || next === 'business' ? nearTown ?? townId : null;
    if (next !== level || nextDistrict !== districtId || nextTown !== townId) {
      set({ level: next, districtId: nextDistrict, townId: nextTown });
    }
  },
}));
