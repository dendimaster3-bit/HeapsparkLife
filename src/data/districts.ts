import type { District, DistrictId } from '@/types/geo';
import { DISTRICT_LABELS, DISTRICT_SHAPES } from './districtShapes';

/**
 * The 9 districts of Mauritius. Outlines are traced from a district map by
 * `scripts/trace-districts.py` into `districtShapes.ts`.
 */
export const DISTRICTS: District[] = [
  {
    id: 'port-louis',
    name: 'Port Louis',
    color: '#f43f5e',
    shape: DISTRICT_SHAPES['port-louis'],
    center: DISTRICT_LABELS['port-louis'],
    blurbKey: 'district.port-louis.blurb',
  },
  {
    id: 'pamplemousses',
    name: 'Pamplemousses',
    color: '#22c55e',
    shape: DISTRICT_SHAPES['pamplemousses'],
    center: DISTRICT_LABELS['pamplemousses'],
    blurbKey: 'district.pamplemousses.blurb',
  },
  {
    id: 'riviere-du-rempart',
    name: 'Rivière du Rempart',
    color: '#06b6d4',
    shape: DISTRICT_SHAPES['riviere-du-rempart'],
    center: DISTRICT_LABELS['riviere-du-rempart'],
    blurbKey: 'district.riviere-du-rempart.blurb',
  },
  {
    id: 'flacq',
    name: 'Flacq',
    color: '#f97316',
    shape: DISTRICT_SHAPES['flacq'],
    center: DISTRICT_LABELS['flacq'],
    blurbKey: 'district.flacq.blurb',
  },
  {
    id: 'moka',
    name: 'Moka',
    color: '#a855f7',
    shape: DISTRICT_SHAPES['moka'],
    center: DISTRICT_LABELS['moka'],
    blurbKey: 'district.moka.blurb',
  },
  {
    id: 'plaines-wilhems',
    name: 'Plaines Wilhems',
    color: '#3b82f6',
    shape: DISTRICT_SHAPES['plaines-wilhems'],
    center: DISTRICT_LABELS['plaines-wilhems'],
    blurbKey: 'district.plaines-wilhems.blurb',
  },
  {
    id: 'grand-port',
    name: 'Grand Port',
    color: '#eab308',
    shape: DISTRICT_SHAPES['grand-port'],
    center: DISTRICT_LABELS['grand-port'],
    blurbKey: 'district.grand-port.blurb',
  },
  {
    id: 'savanne',
    name: 'Savanne',
    color: '#84cc16',
    shape: DISTRICT_SHAPES['savanne'],
    center: DISTRICT_LABELS['savanne'],
    blurbKey: 'district.savanne.blurb',
  },
  {
    id: 'black-river',
    name: 'Black River',
    color: '#ec4899',
    shape: DISTRICT_SHAPES['black-river'],
    center: DISTRICT_LABELS['black-river'],
    blurbKey: 'district.black-river.blurb',
  },
];

export const DISTRICTS_BY_ID = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, d]),
) as Record<DistrictId, District>;
