/**
 * Building styles: subcategory style → base shape + signature prop.
 *
 * To add a new look:
 *   1. write a prop component in `props/` (it receives KitPartProps),
 *   2. add one entry below,
 *   3. point a subcategory at it in `data/categories.ts`.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { BaseShape, BuildingStyleId } from '@/types/business';
import type { KitPartProps } from './kit';

export interface BuildingStyle {
  label: string;
  base: BaseShape;
  /** Signature prop, code-split so unused styles cost nothing. */
  Prop: LazyExoticComponent<ComponentType<KitPartProps>>;
}

export const BUILDING_STYLES: Record<BuildingStyleId, BuildingStyle> = {
  'car-wash': { label: 'Car wash', base: 'shop', Prop: lazy(() => import('./props/CarWashBay')) },
  restaurant: { label: 'Restaurant', base: 'twoStorey', Prop: lazy(() => import('./props/Terrace')) },
  'street-food': { label: 'Street food / snack', base: 'kiosk', Prop: lazy(() => import('./props/FoodCart')) },
  salon: { label: 'Hair & beauty salon', base: 'shop', Prop: lazy(() => import('./props/BarberPole')) },
  garage: { label: 'Mechanic / garage', base: 'largeVenue', Prop: lazy(() => import('./props/CarLift')) },
  pharmacy: { label: 'Pharmacy / clinic', base: 'shop', Prop: lazy(() => import('./props/GreenCross')) },
  bakery: { label: 'Bakery', base: 'shop', Prop: lazy(() => import('./props/BakeryChimney')) },
  'home-services': { label: 'Home services', base: 'shop', Prop: lazy(() => import('./props/ServiceVan')) },
  construction: { label: 'Construction & trades', base: 'largeVenue', Prop: lazy(() => import('./props/MiniCrane')) },
  retail: { label: 'Retail shop', base: 'shop', Prop: lazy(() => import('./props/AwningWindow')) },
  office: { label: 'Professional services', base: 'twoStorey', Prop: lazy(() => import('./props/OfficeEntrance')) },
};
