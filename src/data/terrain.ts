import type { LatLon, Peak } from '@/types/geo';

/**
 * Stylised coastline, clockwise from Cap Malheureux. Not GIS-accurate —
 * just enough points to read as Mauritius.
 */
export const COASTLINE: LatLon[] = [
  [-19.982, 57.614], // Cap Malheureux
  [-19.995, 57.64],
  [-20.004, 57.668], // Grand Gaube
  [-20.03, 57.685],
  [-20.055, 57.69], // Poudre d'Or
  [-20.09, 57.715],
  [-20.12, 57.742], // Poste Lafayette
  [-20.16, 57.758],
  [-20.19, 57.775], // Belle Mare
  [-20.235, 57.79], // Trou d'Eau Douce
  [-20.29, 57.783], // Grand River South East
  [-20.33, 57.765],
  [-20.37, 57.74], // Vieux Grand Port
  [-20.4, 57.715], // Mahébourg
  [-20.442, 57.718], // Blue Bay
  [-20.47, 57.67],
  [-20.495, 57.6],
  [-20.515, 57.53], // Souillac / Gris Gris
  [-20.508, 57.46],
  [-20.5, 57.4], // Bel Ombre
  [-20.49, 57.37], // Baie du Cap
  [-20.475, 57.33],
  [-20.462, 57.305], // Le Morne
  [-20.44, 57.33],
  [-20.425, 57.355], // La Gaulette
  [-20.37, 57.36],
  [-20.325, 57.363], // Tamarin
  [-20.275, 57.363], // Flic en Flac
  [-20.235, 57.385],
  [-20.205, 57.405], // Albion
  [-20.175, 57.445],
  [-20.165, 57.48],
  [-20.152, 57.495], // Port Louis harbour
  [-20.13, 57.508],
  [-20.105, 57.512], // Baie du Tombeau
  [-20.07, 57.528],
  [-20.04, 57.538], // Trou aux Biches
  [-20.01, 57.552], // Pointe aux Canonniers
  [-20.002, 57.575], // Grand Baie
  [-19.99, 57.595],
];

/** Hills and mountains, applied as gaussian bumps on the terrain. */
export const PEAKS: Peak[] = [
  { name: 'Central Plateau', at: [-20.33, 57.52], height: 1.6, radius: 11 },
  { name: 'Black River Gorges', at: [-20.4, 57.44], height: 2.6, radius: 6 },
  { name: 'Piton de la Petite Rivière Noire', at: [-20.4, 57.425], height: 1.6, radius: 1.8 },
  { name: 'Le Pouce', at: [-20.2, 57.528], height: 1.6, radius: 1.6 },
  { name: 'Pieter Both', at: [-20.19, 57.553], height: 1.5, radius: 1.4 },
  { name: 'Signal Mountain', at: [-20.165, 57.495], height: 0.6, radius: 1.2 },
  { name: 'Corps de Garde', at: [-20.27, 57.45], height: 1.3, radius: 2 },
  { name: 'Rempart', at: [-20.33, 57.42], height: 1.6, radius: 2 },
  { name: 'Montagne Bambous', at: [-20.3, 57.7], height: 1.3, radius: 3.5 },
  { name: 'Lion Mountain', at: [-20.37, 57.7], height: 0.9, radius: 1.6 },
  { name: 'Montagne Blanche', at: [-20.27, 57.65], height: 0.8, radius: 2.5 },
  { name: 'Savanne Hills', at: [-20.44, 57.53], height: 1.2, radius: 5 },
  // Le Morne itself is rendered as a landmark mesh on top of a small base.
  { name: 'Le Morne base', at: [-20.452, 57.318], height: 0.5, radius: 1.5 },
];

/** Lakes carved into the terrain (rendered as flat water discs). */
export const LAKES: { name: string; at: LatLon; radius: number }[] = [
  { name: 'Mare aux Vacoas', at: [-20.37, 57.49], radius: 0.9 },
  { name: 'Midlands Dam', at: [-20.3, 57.59], radius: 0.7 },
];

/** Areas levelled flat (e.g. the airport runway). */
export const FLAT_ZONES: { name: string; at: LatLon; radius: number }[] = [
  { name: 'Airport', at: [-20.432, 57.683], radius: 2 },
];
