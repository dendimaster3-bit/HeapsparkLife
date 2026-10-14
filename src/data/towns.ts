import type { Town } from '@/types/geo';

/**
 * Towns and localities. Coordinates are approximate lat/lon — to add a new
 * locality, append a row (look the coordinates up on any map). `kind`
 * controls how many filler houses are generated around it.
 */
export const TOWNS: Town[] = [
  // Port Louis
  { id: 'port-louis', districtId: 'port-louis', name: 'Port Louis', at: [-20.162, 57.502], kind: 'city' },

  // Pamplemousses
  { id: 'pamplemousses', districtId: 'pamplemousses', name: 'Pamplemousses', at: [-20.104, 57.575], kind: 'town' },
  { id: 'triolet', districtId: 'pamplemousses', name: 'Triolet', at: [-20.057, 57.55], kind: 'town' },
  { id: 'terre-rouge', districtId: 'pamplemousses', name: 'Terre Rouge', at: [-20.127, 57.535], kind: 'village' },
  { id: 'trou-aux-biches', districtId: 'pamplemousses', name: 'Trou aux Biches', at: [-20.036, 57.55], kind: 'village' },
  { id: 'baie-du-tombeau', districtId: 'pamplemousses', name: 'Baie du Tombeau', at: [-20.118, 57.52], kind: 'village' },

  // Rivière du Rempart
  { id: 'grand-baie', districtId: 'riviere-du-rempart', name: 'Grand Baie', at: [-20.013, 57.587], kind: 'town' },
  { id: 'goodlands', districtId: 'riviere-du-rempart', name: 'Goodlands', at: [-20.035, 57.643], kind: 'town' },
  { id: 'riviere-du-rempart', districtId: 'riviere-du-rempart', name: 'Rivière du Rempart', at: [-20.1, 57.68], kind: 'village' },
  { id: 'grand-gaube', districtId: 'riviere-du-rempart', name: 'Grand Gaube', at: [-20.01, 57.663], kind: 'village' },
  { id: 'cap-malheureux', districtId: 'riviere-du-rempart', name: 'Cap Malheureux', at: [-19.988, 57.616], kind: 'village' },

  // Flacq
  { id: 'centre-de-flacq', districtId: 'flacq', name: 'Centre de Flacq', at: [-20.189, 57.718], kind: 'town' },
  { id: 'belle-mare', districtId: 'flacq', name: 'Belle Mare', at: [-20.19, 57.76], kind: 'village' },
  { id: 'trou-d-eau-douce', districtId: 'flacq', name: "Trou d'Eau Douce", at: [-20.24, 57.78], kind: 'village' },
  { id: 'lalmatie', districtId: 'flacq', name: 'Lalmatie', at: [-20.19, 57.66], kind: 'village' },
  { id: 'bel-air', districtId: 'flacq', name: 'Bel Air Rivière Sèche', at: [-20.256, 57.745], kind: 'village' },

  // Moka
  { id: 'moka', districtId: 'moka', name: 'Moka', at: [-20.232, 57.567], kind: 'town' },
  { id: 'saint-pierre', districtId: 'moka', name: 'Saint Pierre', at: [-20.215, 57.53], kind: 'village' },
  { id: 'quartier-militaire', districtId: 'moka', name: 'Quartier Militaire', at: [-20.25, 57.6], kind: 'village' },

  // Plaines Wilhems
  { id: 'curepipe', districtId: 'plaines-wilhems', name: 'Curepipe', at: [-20.316, 57.526], kind: 'city' },
  { id: 'quatre-bornes', districtId: 'plaines-wilhems', name: 'Quatre Bornes', at: [-20.264, 57.479], kind: 'city' },
  { id: 'vacoas-phoenix', districtId: 'plaines-wilhems', name: 'Vacoas-Phoenix', at: [-20.298, 57.49], kind: 'city' },
  { id: 'rose-hill', districtId: 'plaines-wilhems', name: 'Rose Hill', at: [-20.238, 57.466], kind: 'city' },
  { id: 'ebene', districtId: 'plaines-wilhems', name: 'Ebène', at: [-20.244, 57.49], kind: 'town' },

  // Grand Port
  { id: 'mahebourg', districtId: 'grand-port', name: 'Mahébourg', at: [-20.408, 57.7], kind: 'town' },
  { id: 'rose-belle', districtId: 'grand-port', name: 'Rose-Belle', at: [-20.4, 57.597], kind: 'town' },
  { id: 'plaine-magnien', districtId: 'grand-port', name: 'Plaine Magnien', at: [-20.425, 57.655], kind: 'village' },
  { id: 'vieux-grand-port', districtId: 'grand-port', name: 'Vieux Grand Port', at: [-20.37, 57.72], kind: 'village' },

  // Savanne
  { id: 'souillac', districtId: 'savanne', name: 'Souillac', at: [-20.512, 57.517], kind: 'town' },
  { id: 'chemin-grenier', districtId: 'savanne', name: 'Chemin Grenier', at: [-20.487, 57.466], kind: 'town' },
  { id: 'riviere-des-anguilles', districtId: 'savanne', name: 'Rivière des Anguilles', at: [-20.485, 57.553], kind: 'village' },
  { id: 'bel-ombre', districtId: 'savanne', name: 'Bel Ombre', at: [-20.498, 57.405], kind: 'village' },

  // Black River
  { id: 'tamarin', districtId: 'black-river', name: 'Tamarin', at: [-20.326, 57.375], kind: 'town' },
  { id: 'flic-en-flac', districtId: 'black-river', name: 'Flic en Flac', at: [-20.274, 57.374], kind: 'town' },
  { id: 'bambous', districtId: 'black-river', name: 'Bambous', at: [-20.257, 57.41], kind: 'village' },
  { id: 'la-gaulette', districtId: 'black-river', name: 'La Gaulette', at: [-20.428, 57.362], kind: 'village' },
  { id: 'grande-riviere-noire', districtId: 'black-river', name: 'Grande Rivière Noire', at: [-20.36, 57.375], kind: 'village' },
];

export const TOWNS_BY_ID: Record<string, Town> = Object.fromEntries(
  TOWNS.map((t) => [t.id, t]),
);
