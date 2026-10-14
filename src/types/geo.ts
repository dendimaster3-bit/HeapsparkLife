/**
 * Geography types for the stylised island.
 *
 * All positions in data files are stored as approximate real-world
 * latitude/longitude so new localities can be added by looking them up on
 * any map. `lib/geo.ts` projects them into world units (1 unit ≈ 1 km).
 */

/** [latitude, longitude] in decimal degrees (south latitudes are negative). */
export type LatLon = readonly [lat: number, lon: number];

/** World-space ground position: [x (east), z (south)] in km. */
export type Vec2 = readonly [x: number, z: number];

export type DistrictId =
  | 'port-louis'
  | 'pamplemousses'
  | 'riviere-du-rempart'
  | 'flacq'
  | 'moka'
  | 'plaines-wilhems'
  | 'grand-port'
  | 'savanne'
  | 'black-river';

export interface District {
  id: DistrictId;
  name: string;
  /** Accent colour used for terrain tint, roofs, labels and UI chips. */
  color: string;
  /**
   * Seed points that "own" the land around them. A point on the island
   * belongs to the district with the nearest (weighted) seed, which gives
   * stylised, readable zones without hand-drawn polygons.
   */
  seeds: { at: LatLon; weight?: number }[];
  /** Where the label sits and the camera looks when zooming into the district. */
  center: LatLon;
  /** Camera distance (km) when focused on this district. */
  zoomDistance: number;
  /** i18n key for the short intro shown on the district loading card. */
  blurbKey: string;
}

export type TownKind = 'city' | 'town' | 'village';

export interface Town {
  id: string;
  districtId: DistrictId;
  name: string;
  at: LatLon;
  kind: TownKind;
}

export type LandmarkKind =
  | 'le-morne'
  | 'waterfront'
  | 'botanical-garden'
  | 'grand-bassin'
  | 'coloured-earth'
  | 'trou-aux-cerfs'
  | 'ile-aux-cerfs'
  | 'airport';

export interface Landmark {
  id: string;
  kind: LandmarkKind;
  districtId: DistrictId;
  name: string;
  at: LatLon;
  /** Optional rotation around Y in degrees. */
  rotation?: number;
}

export type RoadKind = 'motorway' | 'main' | 'coastal';

export interface Road {
  id: string;
  name: string;
  kind: RoadKind;
  points: LatLon[];
  /** Closed loop (e.g. the coastal road). */
  loop?: boolean;
}

/** A gaussian hill/mountain used to shape terrain. */
export interface Peak {
  name: string;
  at: LatLon;
  /** Height in world units (exaggerated for readability). */
  height: number;
  /** Radius (km) of the bump. */
  radius: number;
}

/** Camera zoom levels from far to near. */
export type ZoomLevel = 'island' | 'district' | 'town' | 'business';
