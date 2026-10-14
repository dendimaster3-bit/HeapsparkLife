/**
 * DEMO DATA — fictional businesses so the map isn't empty. Every row has
 * `isDemo: true`; names, phone numbers and websites are made up (phones
 * use the unassigned +230 5000 00xx range, websites use example.com).
 * Plot ids are `<townId>-<n>` (see `game/world/plots.ts`).
 */
import type { Business, WeeklyHours } from '@/types/business';
import type { DistrictId } from '@/types/geo';

const wk = (open: string, close: string, days: (keyof WeeklyHours)[]): WeeklyHours =>
  Object.fromEntries(days.map((d) => [d, [[open, close]]]));
const MON_FRI: (keyof WeeklyHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
const MON_SAT: (keyof WeeklyHours)[] = [...MON_FRI, 'sat'];
const ALL: (keyof WeeklyHours)[] = [...MON_SAT, 'sun'];

/** Typical opening hours presets. */
export const HOURS = {
  shop: wk('08:30', '17:30', MON_SAT),
  office: wk('08:30', '16:30', MON_FRI),
  restaurant: { ...wk('11:00', '22:30', ['tue', 'wed', 'thu', 'fri', 'sat', 'sun']) },
  snack: wk('09:00', '21:00', ALL),
  bakery: { ...wk('06:00', '19:00', MON_SAT), sun: [['06:00', '12:00']] },
  pharmacy: { ...wk('08:00', '20:00', MON_SAT), sun: [['08:00', '12:00']] },
  garage: { ...wk('08:00', '17:00', MON_FRI), sat: [['08:00', '12:00']] },
  carWash: wk('07:30', '18:00', ALL),
} satisfies Record<string, WeeklyHours>;

let n = 0;
function demo(
  b: Pick<Business, 'id' | 'name' | 'subcategoryId' | 'townId' | 'plotId' | 'brandColor' | 'hours'> & {
    districtId: DistrictId;
  } & Partial<Business>,
): Business {
  n++;
  const phone = `+230 5000 00${String(n).padStart(2, '0')}`;
  return {
    photos: [],
    phone,
    whatsapp: phone,
    status: 'approved',
    growthLevel: 1,
    isFoundingMember: false,
    isDemo: true,
    createdAt: '2026-10-01T08:00:00+04:00',
    ...b,
  };
}

export const DEMO_BUSINESSES: Business[] = [
  // Port Louis
  demo({ id: 'demo-la-kaz-kreol', name: 'La Kaz Kreol', subcategoryId: 'restaurant', districtId: 'port-louis', townId: 'port-louis', plotId: 'port-louis-0', brandColor: '#dc2626', hours: HOURS.restaurant, growthLevel: 3, isFoundingMember: true, foundingMemberNo: 1, description: 'Rougaille, curry and fresh fish on a shady terrace.', website: 'https://example.com' }),
  demo({ id: 'demo-ti-dholl-puri', name: 'Ti Dholl Puri', subcategoryId: 'street-food', districtId: 'port-louis', townId: 'port-louis', plotId: 'port-louis-1', brandColor: '#f59e0b', hours: HOURS.snack, growthLevel: 2 }),
  demo({ id: 'demo-pharmacie-lakord', name: 'Pharmacie Lakord', subcategoryId: 'pharmacy', districtId: 'port-louis', townId: 'port-louis', plotId: 'port-louis-2', brandColor: '#16a34a', hours: HOURS.pharmacy }),
  demo({ id: 'demo-rempart-accounting', name: 'Rempart Accounting', subcategoryId: 'accountant', districtId: 'port-louis', townId: 'port-louis', plotId: 'port-louis-3', brandColor: '#1e3a8a', hours: HOURS.office }),
  demo({ id: 'demo-bazar-couleurs', name: 'Bazar Couleurs', subcategoryId: 'clothing', districtId: 'port-louis', townId: 'port-louis', plotId: 'port-louis-4', brandColor: '#c026d3', hours: HOURS.shop, growthLevel: 2 }),

  // Plaines Wilhems
  demo({ id: 'demo-boulangerie-lafarine', name: 'Boulangerie Lafarine', subcategoryId: 'bakery', districtId: 'plaines-wilhems', townId: 'curepipe', plotId: 'curepipe-0', brandColor: '#b45309', hours: HOURS.bakery, growthLevel: 3, isFoundingMember: true, foundingMemberNo: 2 }),
  demo({ id: 'demo-lavaz-kleen', name: 'Lavaz Kleen Car Wash', subcategoryId: 'car-wash', districtId: 'plaines-wilhems', townId: 'curepipe', plotId: 'curepipe-1', brandColor: '#0284c7', hours: HOURS.carWash, growthLevel: 2 }),
  demo({ id: 'demo-coiffure-zoli', name: 'Coiffure Zoli', subcategoryId: 'hair-salon', districtId: 'plaines-wilhems', townId: 'quatre-bornes', plotId: 'quatre-bornes-0', brandColor: '#db2777', hours: HOURS.shop, isFoundingMember: true, foundingMemberNo: 3 }),
  demo({ id: 'demo-mode-bornes', name: 'Mode Bornes', subcategoryId: 'clothing', districtId: 'plaines-wilhems', townId: 'quatre-bornes', plotId: 'quatre-bornes-1', brandColor: '#7c3aed', hours: HOURS.shop }),
  demo({ id: 'demo-garaz-vacoas', name: 'Garaz Vacoas Motors', subcategoryId: 'garage', districtId: 'plaines-wilhems', townId: 'vacoas-phoenix', plotId: 'vacoas-phoenix-0', brandColor: '#475569', hours: HOURS.garage, growthLevel: 2 }),
  demo({ id: 'demo-kafe-rose', name: 'Kafe Rose', subcategoryId: 'cafe', districtId: 'plaines-wilhems', townId: 'rose-hill', plotId: 'rose-hill-0', brandColor: '#e11d48', hours: HOURS.restaurant }),
  demo({ id: 'demo-cyber-byte', name: 'Cyber Byte IT', subcategoryId: 'it-services', districtId: 'plaines-wilhems', townId: 'ebene', plotId: 'ebene-0', brandColor: '#0891b2', hours: HOURS.office, growthLevel: 3 }),

  // Pamplemousses
  demo({ id: 'demo-gato-pima', name: 'Gato Pima Triolet', subcategoryId: 'street-food', districtId: 'pamplemousses', townId: 'triolet', plotId: 'triolet-0', brandColor: '#ea580c', hours: HOURS.snack, isFoundingMember: true, foundingMemberNo: 4 }),
  demo({ id: 'demo-tuyo-plombier', name: 'Tuyo Plumbing', subcategoryId: 'plumber', districtId: 'pamplemousses', townId: 'pamplemousses', plotId: 'pamplemousses-0', brandColor: '#2563eb', hours: HOURS.garage }),
  demo({ id: 'demo-beton-rouge', name: 'Beton Rouge Construction', subcategoryId: 'construction', districtId: 'pamplemousses', townId: 'terre-rouge', plotId: 'terre-rouge-0', brandColor: '#d97706', hours: HOURS.garage, growthLevel: 2 }),

  // Rivière du Rempart
  demo({ id: 'demo-lagon-bleu-grill', name: 'Lagon Bleu Grill', subcategoryId: 'restaurant', districtId: 'riviere-du-rempart', townId: 'grand-baie', plotId: 'grand-baie-0', brandColor: '#0369a1', hours: HOURS.restaurant, growthLevel: 3, isFoundingMember: true, foundingMemberNo: 5 }),
  demo({ id: 'demo-zen-lagon-spa', name: 'Zen Lagon Spa', subcategoryId: 'spa', districtId: 'riviere-du-rempart', townId: 'grand-baie', plotId: 'grand-baie-1', brandColor: '#0d9488', hours: HOURS.shop }),
  demo({ id: 'demo-pneu-nord', name: 'Pneu Nord', subcategoryId: 'tyre-shop', districtId: 'riviere-du-rempart', townId: 'goodlands', plotId: 'goodlands-0', brandColor: '#111827', hours: HOURS.garage }),
  demo({ id: 'demo-marche-nord', name: 'Marche Nord Supermarket', subcategoryId: 'supermarket', districtId: 'riviere-du-rempart', townId: 'goodlands', plotId: 'goodlands-1', brandColor: '#15803d', hours: HOURS.shop, growthLevel: 2 }),

  // Flacq
  demo({ id: 'demo-kwin-hardware', name: 'Kwin Hardware', subcategoryId: 'hardware', districtId: 'flacq', townId: 'centre-de-flacq', plotId: 'centre-de-flacq-0', brandColor: '#ca8a04', hours: HOURS.shop, isFoundingMember: true, foundingMemberNo: 6 }),
  demo({ id: 'demo-barber-flacq', name: 'Barber Flacq', subcategoryId: 'barber', districtId: 'flacq', townId: 'centre-de-flacq', plotId: 'centre-de-flacq-1', brandColor: '#be123c', hours: HOURS.shop }),
  demo({ id: 'demo-belle-mare-kafe', name: 'Belle Mare Beach Café', subcategoryId: 'cafe', districtId: 'flacq', townId: 'belle-mare', plotId: 'belle-mare-0', brandColor: '#0ea5e9', hours: HOURS.snack, growthLevel: 2 }),

  // Moka
  demo({ id: 'demo-klinik-moka', name: 'Klinik Moka Health', subcategoryId: 'clinic', districtId: 'moka', townId: 'moka', plotId: 'moka-0', brandColor: '#059669', hours: HOURS.pharmacy, growthLevel: 2, isFoundingMember: true, foundingMemberNo: 7 }),
  demo({ id: 'demo-elek-st-pierre', name: 'Elek Saint Pierre', subcategoryId: 'electrician', districtId: 'moka', townId: 'saint-pierre', plotId: 'saint-pierre-0', brandColor: '#eab308', hours: HOURS.garage }),

  // Grand Port
  demo({ id: 'demo-pain-mahebourg', name: 'Pain Mahébourg', subcategoryId: 'bakery', districtId: 'grand-port', townId: 'mahebourg', plotId: 'mahebourg-0', brandColor: '#92400e', hours: HOURS.bakery }),
  demo({ id: 'demo-mahe-wash', name: 'Mahé Wash', subcategoryId: 'car-wash', districtId: 'grand-port', townId: 'mahebourg', plotId: 'mahebourg-1', brandColor: '#06b6d4', hours: HOURS.carWash }),
  demo({ id: 'demo-rose-belle-auto', name: 'Rose-Belle Auto', subcategoryId: 'garage', districtId: 'grand-port', townId: 'rose-belle', plotId: 'rose-belle-0', brandColor: '#dc2626', hours: HOURS.garage, growthLevel: 3 }),

  // Savanne
  demo({ id: 'demo-snack-gris-gris', name: 'Snack Gris Gris', subcategoryId: 'street-food', districtId: 'savanne', townId: 'souillac', plotId: 'souillac-0', brandColor: '#65a30d', hours: HOURS.snack }),
  demo({ id: 'demo-dentist-sid', name: 'Dentiste du Sud', subcategoryId: 'dentist', districtId: 'savanne', townId: 'chemin-grenier', plotId: 'chemin-grenier-0', brandColor: '#0284c7', hours: HOURS.office }),

  // Black River
  demo({ id: 'demo-tamarin-sunset', name: 'Tamarin Sunset Kitchen', subcategoryId: 'restaurant', districtId: 'black-river', townId: 'tamarin', plotId: 'tamarin-0', brandColor: '#f97316', hours: HOURS.restaurant, growthLevel: 2, isFoundingMember: true, foundingMemberNo: 8 }),
  demo({ id: 'demo-plaz-beach-shop', name: 'Plaz Beach Shop', subcategoryId: 'retail', districtId: 'black-river', townId: 'flic-en-flac', plotId: 'flic-en-flac-0', brandColor: '#f43f5e', hours: HOURS.shop }),
  demo({ id: 'demo-prop-prop', name: 'Prop Prop Cleaning', subcategoryId: 'cleaning', districtId: 'black-river', townId: 'flic-en-flac', plotId: 'flic-en-flac-1', brandColor: '#8b5cf6', hours: HOURS.office }),
  demo({ id: 'demo-bwa-bambous', name: 'Bwa Bambous Joinery', subcategoryId: 'carpenter', districtId: 'black-river', townId: 'bambous', plotId: 'bambous-0', brandColor: '#a16207', hours: HOURS.garage }),
];
