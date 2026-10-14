/**
 * DEMO promos. Step (b) only needs to know which businesses have an active
 * promo (for the light beam); step (d) fleshes out the full promo model.
 */
export interface DemoPromoStub {
  id: string;
  businessId: string;
  title: string;
  expiresAt: string;
}

export const DEMO_PROMOS: DemoPromoStub[] = [
  { id: 'promo-kaz-kreol-15', businessId: 'demo-la-kaz-kreol', title: '15% off your first meal', expiresAt: '2027-03-31T23:59:00+04:00' },
  { id: 'promo-lafarine-free', businessId: 'demo-boulangerie-lafarine', title: 'Free baguette with any cake', expiresAt: '2027-01-31T23:59:00+04:00' },
  { id: 'promo-lavaz-100', businessId: 'demo-lavaz-kleen', title: 'Rs 100 off a full valet', expiresAt: '2027-02-28T23:59:00+04:00' },
  { id: 'promo-zoli-20', businessId: 'demo-coiffure-zoli', title: '20% off colour', expiresAt: '2027-01-15T23:59:00+04:00' },
  { id: 'promo-lagon-dessert', businessId: 'demo-lagon-bleu-grill', title: 'Free dessert for two', expiresAt: '2027-04-30T23:59:00+04:00' },
  { id: 'promo-gato-pima', businessId: 'demo-gato-pima', title: '10 gato pima for the price of 8', expiresAt: '2027-02-28T23:59:00+04:00' },
  { id: 'promo-tamarin-sunset', businessId: 'demo-tamarin-sunset', title: 'Sunset cocktail on the house', expiresAt: '2027-03-31T23:59:00+04:00' },
  { id: 'promo-rose-belle-check', businessId: 'demo-rose-belle-auto', title: 'Free 20-point safety check', expiresAt: '2027-05-31T23:59:00+04:00' },
  { id: 'promo-marche-nord', businessId: 'demo-marche-nord', title: 'Rs 200 off a Rs 2000 shop', expiresAt: '2026-12-31T23:59:00+04:00' },
];
