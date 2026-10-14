import type { Category, CategoryId, Subcategory } from '@/types/business';

/** Main categories (match heapspark.com). */
export const CATEGORIES: Category[] = [
  { id: 'restaurants-food', name: 'Restaurants & Food', icon: '🍛', color: '#f97316' },
  { id: 'beauty-wellness', name: 'Beauty & Wellness', icon: '💇', color: '#ec4899' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', color: '#0ea5e9' },
  { id: 'home-services', name: 'Home Services', icon: '🔧', color: '#3b82f6' },
  { id: 'construction-trades', name: 'Construction & Trades', icon: '🏗️', color: '#f59e0b' },
  { id: 'health-medical', name: 'Health & Medical', icon: '⚕️', color: '#22c55e' },
  { id: 'professional-services', name: 'Professional Services', icon: '💼', color: '#6366f1' },
  { id: 'shopping-retail', name: 'Shopping & Retail', icon: '🛍️', color: '#a855f7' },
];

/**
 * Subcategories → building style. Adding a subcategory that reuses an
 * existing style is one row here; a brand-new look needs one registry
 * entry + one prop component (see `game/buildings/registry.ts`).
 */
export const SUBCATEGORIES: Subcategory[] = [
  // Restaurants & Food
  { id: 'restaurant', icon: '🍛', categoryId: 'restaurants-food', name: 'Restaurant', styleId: 'restaurant' },
  { id: 'cafe', icon: '☕', categoryId: 'restaurants-food', name: 'Café', styleId: 'restaurant', base: 'shop' },
  { id: 'street-food', icon: '🥙', categoryId: 'restaurants-food', name: 'Street food & snack', styleId: 'street-food' },
  { id: 'bakery', icon: '🥖', categoryId: 'restaurants-food', name: 'Bakery', styleId: 'bakery' },
  // Beauty & Wellness
  { id: 'hair-salon', icon: '💇', categoryId: 'beauty-wellness', name: 'Hair & beauty salon', styleId: 'salon' },
  { id: 'barber', icon: '💈', categoryId: 'beauty-wellness', name: 'Barber', styleId: 'salon', base: 'kiosk' },
  { id: 'spa', icon: '💆', categoryId: 'beauty-wellness', name: 'Spa & massage', styleId: 'salon', base: 'twoStorey' },
  // Automotive
  { id: 'car-wash', icon: '🧽', categoryId: 'automotive', name: 'Car wash', styleId: 'car-wash' },
  { id: 'garage', icon: '🔧', categoryId: 'automotive', name: 'Mechanic / garage', styleId: 'garage' },
  { id: 'tyre-shop', icon: '🛞', categoryId: 'automotive', name: 'Tyres & batteries', styleId: 'garage', base: 'shop' },
  // Home Services
  { id: 'plumber', icon: '🚰', categoryId: 'home-services', name: 'Plumber', styleId: 'home-services' },
  { id: 'electrician', icon: '💡', categoryId: 'home-services', name: 'Electrician', styleId: 'home-services' },
  { id: 'cleaning', icon: '🧹', categoryId: 'home-services', name: 'Cleaning', styleId: 'home-services' },
  // Construction & Trades
  { id: 'construction', icon: '🏗️', categoryId: 'construction-trades', name: 'Building contractor', styleId: 'construction' },
  { id: 'carpenter', icon: '🪚', categoryId: 'construction-trades', name: 'Carpenter & joinery', styleId: 'construction', base: 'shop' },
  // Health & Medical
  { id: 'pharmacy', icon: '💊', categoryId: 'health-medical', name: 'Pharmacy', styleId: 'pharmacy' },
  { id: 'clinic', icon: '🩺', categoryId: 'health-medical', name: 'Clinic', styleId: 'pharmacy', base: 'twoStorey' },
  { id: 'dentist', icon: '🦷', categoryId: 'health-medical', name: 'Dentist', styleId: 'pharmacy' },
  // Professional Services
  { id: 'accountant', icon: '📊', categoryId: 'professional-services', name: 'Accountant', styleId: 'office' },
  { id: 'lawyer', icon: '⚖️', categoryId: 'professional-services', name: 'Lawyer & notary', styleId: 'office' },
  { id: 'it-services', icon: '💻', categoryId: 'professional-services', name: 'IT services', styleId: 'office' },
  // Shopping & Retail
  { id: 'retail', icon: '🛍️', categoryId: 'shopping-retail', name: 'Retail shop', styleId: 'retail' },
  { id: 'clothing', icon: '👗', categoryId: 'shopping-retail', name: 'Clothing & fashion', styleId: 'retail' },
  { id: 'supermarket', icon: '🛒', categoryId: 'shopping-retail', name: 'Supermarket', styleId: 'retail', base: 'largeVenue' },
  { id: 'hardware', icon: '🔨', categoryId: 'shopping-retail', name: 'Hardware store', styleId: 'retail', base: 'largeVenue' },
];

export const CATEGORIES_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;
export const SUBCATEGORIES_BY_ID: Record<string, Subcategory> = Object.fromEntries(
  SUBCATEGORIES.map((s) => [s.id, s]),
);
