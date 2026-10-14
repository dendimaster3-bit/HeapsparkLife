import type { Road } from '@/types/geo';

/**
 * Road network as lat/lon polylines. The coastal ring road is generated
 * from the coastline in `game/world/roadGeometry.ts`, so only inland roads
 * live here.
 */
export const ROADS: Road[] = [
  {
    id: 'm1',
    name: 'M1 Motorway',
    kind: 'motorway',
    points: [
      [-20.162, 57.505], // Port Louis
      [-20.19, 57.493],
      [-20.215, 57.48],
      [-20.244, 57.492], // Ebène / Réduit
      [-20.27, 57.495],
      [-20.297, 57.505], // Phoenix
      [-20.318, 57.533], // Curepipe
      [-20.36, 57.565],
      [-20.4, 57.6], // Rose-Belle
      [-20.42, 57.645],
      [-20.428, 57.668], // Airport
    ],
  },
  {
    id: 'm2',
    name: 'M2 Motorway',
    kind: 'motorway',
    points: [
      [-20.162, 57.505], // Port Louis
      [-20.13, 57.533], // Terre Rouge
      [-20.1, 57.56],
      [-20.06, 57.568],
      [-20.03, 57.58],
      [-20.013, 57.587], // Grand Baie
    ],
  },
  {
    id: 'moka-flacq',
    name: 'Moka – Flacq Road',
    kind: 'main',
    points: [
      [-20.244, 57.492],
      [-20.232, 57.567], // Moka
      [-20.235, 57.62],
      [-20.205, 57.67],
      [-20.189, 57.718], // Centre de Flacq
      [-20.19, 57.76], // Belle Mare
    ],
  },
  {
    id: 'north-east',
    name: 'Pamplemousses – Goodlands Road',
    kind: 'main',
    points: [
      [-20.104, 57.575],
      [-20.08, 57.6],
      [-20.035, 57.643], // Goodlands
      [-20.06, 57.67],
      [-20.1, 57.68], // Rivière du Rempart
      [-20.15, 57.7],
      [-20.189, 57.718],
    ],
  },
  {
    id: 'curepipe-mahebourg',
    name: 'Curepipe – Mahébourg Road',
    kind: 'main',
    points: [
      [-20.318, 57.533],
      [-20.33, 57.6],
      [-20.37, 57.66],
      [-20.408, 57.7], // Mahébourg
    ],
  },
  {
    id: 'west-coast',
    name: 'Vacoas – Tamarin Road',
    kind: 'main',
    points: [
      [-20.264, 57.479], // Quatre Bornes
      [-20.298, 57.49], // Vacoas
      [-20.31, 57.44],
      [-20.326, 57.39], // Tamarin
    ],
  },
  {
    id: 'south',
    name: 'Rose-Belle – Souillac Road',
    kind: 'main',
    points: [
      [-20.4, 57.597],
      [-20.45, 57.565],
      [-20.485, 57.553],
      [-20.51, 57.52], // Souillac
    ],
  },
  {
    id: 'chamarel',
    name: 'Chamarel Road',
    kind: 'main',
    points: [
      [-20.36, 57.375],
      [-20.41, 57.395],
      [-20.44, 57.385],
      [-20.46, 57.4],
      [-20.487, 57.466], // Chemin Grenier
    ],
  },
];
