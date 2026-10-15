import type { LatLon, Peak } from '@/types/geo';

/** Coastline traced from the district map (see scripts/trace-districts.py). */
export { ISLAND_OUTLINE as COASTLINE } from './districtShapes';

/**
 * Mountains shown as stylised low-poly props in their district's scene
 * (the board itself is flat). `radius` is the footprint in km.
 */
export const PEAKS: Peak[] = [
  { name: 'Black River Gorges', at: [-20.405, 57.445], height: 1.5, radius: 1.6 },
  { name: 'Piton de la Petite Rivière Noire', at: [-20.395, 57.425], height: 1.8, radius: 1.1 },
  { name: 'Le Pouce', at: [-20.2, 57.528], height: 1.3, radius: 0.9 },
  { name: 'Pieter Both', at: [-20.188, 57.556], height: 1.4, radius: 0.8 },
  { name: 'Signal Mountain', at: [-20.168, 57.492], height: 0.7, radius: 0.7 },
  { name: 'Corps de Garde', at: [-20.272, 57.452], height: 1.1, radius: 0.9 },
  { name: 'Rempart', at: [-20.33, 57.425], height: 1.3, radius: 0.9 },
  { name: 'Montagne Bambous', at: [-20.31, 57.7], height: 1.2, radius: 1.4 },
  { name: 'Lion Mountain', at: [-20.365, 57.705], height: 0.9, radius: 0.8 },
  { name: 'Montagne Blanche', at: [-20.272, 57.645], height: 0.8, radius: 1 },
  { name: 'Savanne Hills', at: [-20.455, 57.515], height: 0.9, radius: 1.3 },
];

/** Lakes (flat water discs on the board). */
export const LAKES: { name: string; at: LatLon; radius: number }[] = [
  { name: 'Mare aux Vacoas', at: [-20.37, 57.49], radius: 0.9 },
  { name: 'Midlands Dam', at: [-20.3, 57.59], radius: 0.7 },
];

/** Main rivers as lat/lon polylines from source to the sea. */
export const RIVERS: { name: string; points: LatLon[] }[] = [
  { name: 'Grand River North West', points: [[-20.218, 57.535], [-20.207, 57.505], [-20.193, 57.478], [-20.178, 57.455], [-20.172, 57.44]] },
  { name: 'Rivière Noire', points: [[-20.405, 57.445], [-20.39, 57.415], [-20.372, 57.39], [-20.362, 57.36]] },
  { name: 'Grand River South East', points: [[-20.315, 57.655], [-20.302, 57.705], [-20.292, 57.75], [-20.287, 57.8]] },
  { name: 'Rivière des Anguilles', points: [[-20.44, 57.565], [-20.475, 57.556], [-20.5, 57.56], [-20.53, 57.565]] },
  { name: 'Rivière du Rempart', points: [[-20.115, 57.635], [-20.09, 57.66], [-20.065, 57.69], [-20.05, 57.71]] },
  { name: 'Rivière La Chaux', points: [[-20.355, 57.655], [-20.385, 57.685], [-20.405, 57.71], [-20.415, 57.73]] },
];
