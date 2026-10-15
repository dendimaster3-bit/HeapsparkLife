/**
 * DEMO bookings + founding partner assignments (all fictional, flagged
 * isDemo). Several slots are deliberately left empty to show the
 * "Advertise here" state.
 */
import type { AdBooking, Partner } from '@/types/ads';

const period = { startDate: '2026-10-01', endDate: '2027-03-31', status: 'active' as const, impressions: 0, clicks: 0, isDemo: true };

export const DEMO_BOOKINGS: AdBooking[] = [
  { ...period, id: 'bk-lagon-m2', slotId: 'bb-m2-grand-baie', advertiserBusinessId: 'demo-lagon-bleu-grill', advertiserName: 'Lagon Bleu Grill', creative: { kind: 'text', headline: 'Lagon Bleu Grill', sub: 'Fresh fish, sea views · Grand Baie', bg: '#0369a1' } },
  { ...period, id: 'bk-lafarine-m1', slotId: 'bb-m1-phoenix', advertiserBusinessId: 'demo-boulangerie-lafarine', advertiserName: 'Boulangerie Lafarine', creative: { kind: 'text', headline: 'Boulangerie Lafarine', sub: 'Warm bread from 6am · Curepipe', bg: '#b45309' } },
  { ...period, id: 'bk-lavaz-te', slotId: 'te-curepipe', advertiserBusinessId: 'demo-lavaz-kleen', advertiserName: 'Lavaz Kleen Car Wash', creative: { kind: 'text', headline: 'Lavaz Kleen', sub: 'Your car, shining in 20 min', bg: '#0284c7' } },
  { ...period, id: 'bk-zoli-bs', slotId: 'bs-quatre-bornes', advertiserBusinessId: 'demo-coiffure-zoli', advertiserName: 'Coiffure Zoli', creative: { kind: 'text', headline: 'Coiffure Zoli', sub: '20% off colour', bg: '#db2777' } },
  { ...period, id: 'bk-tamarin-te', slotId: 'te-flic-en-flac', advertiserBusinessId: 'demo-tamarin-sunset', advertiserName: 'Tamarin Sunset Kitchen', creative: { kind: 'text', headline: 'Sunset Kitchen', sub: 'Cocktails at golden hour', bg: '#f97316' } },
  { ...period, id: 'bk-kaz-airport', slotId: 'airport-arrival', advertiserBusinessId: 'demo-la-kaz-kreol', advertiserName: 'La Kaz Kreol', creative: { kind: 'text', headline: 'Bienvini! Your first meal: -15%', sub: 'La Kaz Kreol · Port Louis', bg: '#dc2626' } },
  { ...period, id: 'bk-marche-plane', slotId: 'plane-banner', advertiserBusinessId: 'demo-marche-nord', advertiserName: 'Marche Nord Supermarket', creative: { kind: 'text', headline: 'MARCHE NORD · Rs 200 OFF', bg: '#15803d' } },
];

const at = '2026-10-01T09:00:00+04:00';
export const DEMO_PARTNERS: Partner[] = [
  // District Founding Partners (others left open)
  { id: 'pt-d-port-louis', type: 'districtFounding', businessId: 'demo-la-kaz-kreol', districtId: 'port-louis', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-d-plaines-wilhems', type: 'districtFounding', businessId: 'demo-boulangerie-lafarine', districtId: 'plaines-wilhems', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-d-riviere-du-rempart', type: 'districtFounding', businessId: 'demo-lagon-bleu-grill', districtId: 'riviere-du-rempart', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-d-black-river', type: 'districtFounding', businessId: 'demo-tamarin-sunset', districtId: 'black-river', assignedAt: at, assignedBy: 'admin' },
  // Category Founding Partners
  { id: 'pt-c-car-wash', type: 'categoryFounding', businessId: 'demo-lavaz-kleen', subcategoryId: 'car-wash', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-c-pharmacy', type: 'categoryFounding', businessId: 'demo-pharmacie-lakord', subcategoryId: 'pharmacy', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-c-hair-salon', type: 'categoryFounding', businessId: 'demo-coiffure-zoli', subcategoryId: 'hair-salon', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-c-garage', type: 'categoryFounding', businessId: 'demo-rose-belle-auto', subcategoryId: 'garage', assignedAt: at, assignedBy: 'admin' },
  { id: 'pt-c-street-food', type: 'categoryFounding', businessId: 'demo-gato-pima', subcategoryId: 'street-food', assignedAt: at, assignedBy: 'admin' },
];
