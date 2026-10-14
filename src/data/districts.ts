import type { District, DistrictId } from '@/types/geo';

/**
 * The 9 districts of Mauritius. Seeds shape the coloured zones on the
 * terrain (nearest weighted seed wins), so tweaking a boundary is a matter
 * of nudging or adding a seed. Weights > 1 make a district "reach" further.
 */
export const DISTRICTS: District[] = [
  {
    id: 'port-louis',
    name: 'Port Louis',
    color: '#f43f5e',
    seeds: [{ at: [-20.163, 57.505], weight: 0.55 }],
    center: [-20.163, 57.505],
    zoomDistance: 9,
    blurbKey: 'district.port-louis.blurb',
  },
  {
    id: 'pamplemousses',
    name: 'Pamplemousses',
    color: '#22c55e',
    seeds: [
      { at: [-20.105, 57.565] },
      { at: [-20.055, 57.555], weight: 0.9 },
    ],
    center: [-20.09, 57.565],
    zoomDistance: 16,
    blurbKey: 'district.pamplemousses.blurb',
  },
  {
    id: 'riviere-du-rempart',
    name: 'Rivière du Rempart',
    color: '#06b6d4',
    seeds: [
      { at: [-20.01, 57.62] },
      { at: [-20.06, 57.67] },
      { at: [-20.11, 57.69], weight: 0.9 },
    ],
    center: [-20.05, 57.64],
    zoomDistance: 18,
    blurbKey: 'district.riviere-du-rempart.blurb',
  },
  {
    id: 'flacq',
    name: 'Flacq',
    color: '#f97316',
    seeds: [
      { at: [-20.18, 57.71] },
      { at: [-20.25, 57.74] },
      { at: [-20.16, 57.66], weight: 0.8 },
    ],
    center: [-20.2, 57.72],
    zoomDistance: 20,
    blurbKey: 'district.flacq.blurb',
  },
  {
    id: 'moka',
    name: 'Moka',
    color: '#a855f7',
    seeds: [
      { at: [-20.22, 57.56] },
      { at: [-20.26, 57.6], weight: 0.9 },
    ],
    center: [-20.235, 57.575],
    zoomDistance: 16,
    blurbKey: 'district.moka.blurb',
  },
  {
    id: 'plaines-wilhems',
    name: 'Plaines Wilhems',
    color: '#3b82f6',
    seeds: [
      { at: [-20.255, 57.48] },
      { at: [-20.31, 57.51] },
    ],
    center: [-20.28, 57.495],
    zoomDistance: 16,
    blurbKey: 'district.plaines-wilhems.blurb',
  },
  {
    id: 'grand-port',
    name: 'Grand Port',
    color: '#eab308',
    seeds: [
      { at: [-20.38, 57.65] },
      { at: [-20.42, 57.7] },
      { at: [-20.32, 57.72], weight: 0.9 },
    ],
    center: [-20.39, 57.67],
    zoomDistance: 20,
    blurbKey: 'district.grand-port.blurb',
  },
  {
    id: 'savanne',
    name: 'Savanne',
    color: '#84cc16',
    seeds: [
      { at: [-20.485, 57.46] },
      { at: [-20.48, 57.54] },
    ],
    center: [-20.48, 57.5],
    zoomDistance: 18,
    blurbKey: 'district.savanne.blurb',
  },
  {
    id: 'black-river',
    name: 'Black River',
    color: '#ec4899',
    seeds: [
      { at: [-20.33, 57.39] },
      { at: [-20.42, 57.37] },
      { at: [-20.23, 57.42], weight: 0.9 },
    ],
    center: [-20.36, 57.39],
    zoomDistance: 22,
    blurbKey: 'district.black-river.blurb',
  },
];

export const DISTRICTS_BY_ID = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, d]),
) as Record<DistrictId, District>;
