/**
 * DEMO promos (fictional, attached to demo businesses). In mock mode these
 * seed the in-browser database the first time the app runs.
 */
import type { Promo } from '@/types/promo';

const base = { quantityUnlocked: 0, status: 'active' as const, isDemo: true, rules: {} };

export const DEMO_PROMOS: Promo[] = [
  { ...base, id: 'promo-kaz-kreol-15', businessId: 'demo-la-kaz-kreol', title: '15% off your first meal', discountType: 'percent', discountValue: 15, quantityLimit: 200, expiresAt: '2027-03-31T23:59:00+04:00', rules: { firstVisitOnly: true } },
  { ...base, id: 'promo-lafarine-free', businessId: 'demo-boulangerie-lafarine', title: 'Free baguette with any cake', discountType: 'freebie', quantityLimit: null, expiresAt: '2027-01-31T23:59:00+04:00', codeValidDays: 14 },
  { ...base, id: 'promo-lavaz-100', businessId: 'demo-lavaz-kleen', title: 'Rs 100 off a full valet', discountType: 'amount', discountValue: 100, quantityLimit: 50, quantityUnlocked: 47, expiresAt: '2027-02-28T23:59:00+04:00' },
  { ...base, id: 'promo-zoli-20', businessId: 'demo-coiffure-zoli', title: '20% off colour', discountType: 'percent', discountValue: 20, quantityLimit: 30, expiresAt: '2027-01-15T23:59:00+04:00', rules: { minSpendRs: 1500 } },
  { ...base, id: 'promo-lagon-dessert', businessId: 'demo-lagon-bleu-grill', title: 'Free dessert for two', discountType: 'freebie', quantityLimit: 100, expiresAt: '2027-04-30T23:59:00+04:00', rules: { minSpendRs: 2000 } },
  { ...base, id: 'promo-gato-pima', businessId: 'demo-gato-pima', title: '10 gato pima for the price of 8', discountType: 'freebie', quantityLimit: null, expiresAt: '2027-02-28T23:59:00+04:00' },
  { ...base, id: 'promo-tamarin-sunset', businessId: 'demo-tamarin-sunset', title: 'Sunset cocktail on the house', discountType: 'freebie', quantityLimit: 60, expiresAt: '2027-03-31T23:59:00+04:00', rules: { firstVisitOnly: true } },
  { ...base, id: 'promo-rose-belle-check', businessId: 'demo-rose-belle-auto', title: 'Free 20-point safety check', discountType: 'freebie', quantityLimit: 40, expiresAt: '2027-05-31T23:59:00+04:00' },
  { ...base, id: 'promo-marche-nord', businessId: 'demo-marche-nord', title: 'Rs 200 off a Rs 2000 shop', discountType: 'amount', discountValue: 200, quantityLimit: 500, expiresAt: '2026-12-31T23:59:00+04:00', rules: { minSpendRs: 2000 } },
];
