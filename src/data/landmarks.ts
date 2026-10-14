import type { Landmark } from '@/types/geo';

/** Generic low-poly landmarks (no logos or trademarked designs). */
export const LANDMARKS: Landmark[] = [
  { id: 'le-morne', kind: 'le-morne', districtId: 'black-river', name: 'Le Morne Brabant', at: [-20.452, 57.318] },
  { id: 'waterfront', kind: 'waterfront', districtId: 'port-louis', name: 'Port Louis Waterfront', at: [-20.158, 57.493], rotation: 20 },
  { id: 'botanical-garden', kind: 'botanical-garden', districtId: 'pamplemousses', name: 'Pamplemousses Garden', at: [-20.104, 57.582] },
  { id: 'grand-bassin', kind: 'grand-bassin', districtId: 'savanne', name: 'Grand Bassin', at: [-20.418, 57.492] },
  { id: 'coloured-earth', kind: 'coloured-earth', districtId: 'black-river', name: 'Chamarel Coloured Earth', at: [-20.44, 57.385] },
  { id: 'trou-aux-cerfs', kind: 'trou-aux-cerfs', districtId: 'plaines-wilhems', name: 'Trou aux Cerfs', at: [-20.316, 57.508] },
  { id: 'ile-aux-cerfs', kind: 'ile-aux-cerfs', districtId: 'flacq', name: 'Île aux Cerfs', at: [-20.272, 57.808] },
  { id: 'airport', kind: 'airport', districtId: 'grand-port', name: 'Airport', at: [-20.432, 57.683], rotation: -60 },
];
