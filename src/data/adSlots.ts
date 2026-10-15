/**
 * Ad inventory. Add a slot by adding a row; positions on roads and at town
 * entrances are computed from the map data. Prices are placeholders in MUR.
 */
import type { AdSlot } from '@/types/ads';

export const AD_SLOTS: AdSlot[] = [
  // Motorway billboards
  { id: 'bb-m1-pailles', type: 'billboard', name: 'M1 · Pailles', districtId: 'port-louis', placement: { kind: 'road', roadId: 'm1', t: 0.1, side: 1 }, pricePerMonthRs: 25000 },
  { id: 'bb-m1-reduit', type: 'billboard', name: 'M1 · Réduit', districtId: 'moka', placement: { kind: 'road', roadId: 'm1', t: 0.3, side: -1 }, pricePerMonthRs: 25000 },
  { id: 'bb-m1-phoenix', type: 'billboard', name: 'M1 · Phoenix', districtId: 'plaines-wilhems', placement: { kind: 'road', roadId: 'm1', t: 0.48, side: 1 }, pricePerMonthRs: 22000 },
  { id: 'bb-m1-rose-belle', type: 'billboard', name: 'M1 · Rose-Belle', districtId: 'grand-port', placement: { kind: 'road', roadId: 'm1', t: 0.78, side: -1 }, pricePerMonthRs: 18000 },
  { id: 'bb-m2-terre-rouge', type: 'billboard', name: 'M2 · Terre Rouge', districtId: 'pamplemousses', placement: { kind: 'road', roadId: 'm2', t: 0.3, side: 1 }, pricePerMonthRs: 20000 },
  { id: 'bb-m2-grand-baie', type: 'billboard', name: 'M2 · Grand Baie', districtId: 'riviere-du-rempart', placement: { kind: 'road', roadId: 'm2', t: 0.82, side: -1 }, pricePerMonthRs: 22000 },

  // Town entrances
  { id: 'te-port-louis', type: 'townEntrance', name: 'Port Louis entrance', districtId: 'port-louis', placement: { kind: 'town', townId: 'port-louis' }, pricePerMonthRs: 15000 },
  { id: 'te-curepipe', type: 'townEntrance', name: 'Curepipe entrance', districtId: 'plaines-wilhems', placement: { kind: 'town', townId: 'curepipe' }, pricePerMonthRs: 12000 },
  { id: 'te-grand-baie', type: 'townEntrance', name: 'Grand Baie entrance', districtId: 'riviere-du-rempart', placement: { kind: 'town', townId: 'grand-baie' }, pricePerMonthRs: 12000 },
  { id: 'te-flacq', type: 'townEntrance', name: 'Centre de Flacq entrance', districtId: 'flacq', placement: { kind: 'town', townId: 'centre-de-flacq' }, pricePerMonthRs: 9000 },
  { id: 'te-mahebourg', type: 'townEntrance', name: 'Mahébourg entrance', districtId: 'grand-port', placement: { kind: 'town', townId: 'mahebourg' }, pricePerMonthRs: 9000 },
  { id: 'te-flic-en-flac', type: 'townEntrance', name: 'Flic en Flac entrance', districtId: 'black-river', placement: { kind: 'town', townId: 'flic-en-flac' }, pricePerMonthRs: 10000 },

  // Bus stops
  { id: 'bs-quatre-bornes', type: 'busStop', name: 'Bus stop · Quatre Bornes', districtId: 'plaines-wilhems', placement: { kind: 'town', townId: 'quatre-bornes' }, pricePerMonthRs: 4000 },
  { id: 'bs-rose-hill', type: 'busStop', name: 'Bus stop · Rose Hill', districtId: 'plaines-wilhems', placement: { kind: 'town', townId: 'rose-hill' }, pricePerMonthRs: 4000 },
  { id: 'bs-triolet', type: 'busStop', name: 'Bus stop · Triolet', districtId: 'pamplemousses', placement: { kind: 'town', townId: 'triolet' }, pricePerMonthRs: 3000 },
  { id: 'bs-goodlands', type: 'busStop', name: 'Bus stop · Goodlands', districtId: 'riviere-du-rempart', placement: { kind: 'town', townId: 'goodlands' }, pricePerMonthRs: 3000 },
  { id: 'bs-souillac', type: 'busStop', name: 'Bus stop · Souillac', districtId: 'savanne', placement: { kind: 'town', townId: 'souillac' }, pricePerMonthRs: 2500 },
  { id: 'bs-moka', type: 'busStop', name: 'Bus stop · Moka', districtId: 'moka', placement: { kind: 'town', townId: 'moka' }, pricePerMonthRs: 3000 },

  // Premium
  { id: 'airport-arrival', type: 'airportBanner', name: 'Airport arrival banner', districtId: 'grand-port', placement: { kind: 'point', at: [-20.426, 57.688], rotation: -60 }, pricePerMonthRs: 40000 },
  { id: 'plane-banner', type: 'planeBanner', name: 'Plane banner over the beach', placement: { kind: 'screen' }, pricePerMonthRs: 30000 },
  { id: 'loading-sponsor', type: 'loadingScreen', name: 'Loading screen sponsor', placement: { kind: 'screen' }, pricePerMonthRs: 35000 },
];
