/**
 * Directory + building-kit types. Mirrors the future Supabase tables
 * `categories`, `subcategories`, `building_configs`, `businesses`, `plots`.
 */
import type { DistrictId, Vec2 } from './geo';

export type CategoryId =
  | 'restaurants-food'
  | 'beauty-wellness'
  | 'automotive'
  | 'home-services'
  | 'construction-trades'
  | 'health-medical'
  | 'professional-services'
  | 'shopping-retail';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

/** The 4 base building shapes of the modular kit. */
export type BaseShape = 'kiosk' | 'shop' | 'twoStorey' | 'largeVenue';

/**
 * A building style = base shape + signature prop. Styles live in
 * `game/buildings/registry.ts`; this id links data to that registry.
 */
export type BuildingStyleId =
  | 'car-wash'
  | 'restaurant'
  | 'street-food'
  | 'salon'
  | 'garage'
  | 'pharmacy'
  | 'bakery'
  | 'home-services'
  | 'construction'
  | 'retail'
  | 'office';

export interface Subcategory {
  id: string;
  categoryId: CategoryId;
  name: string;
  styleId: BuildingStyleId;
  /** Optional base override, e.g. a supermarket uses the large venue. */
  base?: BaseShape;
}

/** Opening intervals per weekday as "HH:MM" pairs (Mauritius time). */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WeeklyHours = Partial<Record<Weekday, [open: string, close: string][]>>;

export type GrowthLevel = 1 | 2 | 3;
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Business {
  id: string;
  name: string;
  subcategoryId: string;
  districtId: DistrictId;
  townId: string;
  plotId: string;
  brandColor: string;
  /** Uploaded by the business itself (never a base-game asset). */
  logoUrl?: string;
  photos: string[];
  description?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  hours: WeeklyHours;
  status: ApprovalStatus;
  /** 1–3, grows with reviews and redemptions. */
  growthLevel: GrowthLevel;
  /** First 100 approved businesses get the permanent gold skin. */
  isFoundingMember: boolean;
  foundingMemberNo?: number;
  /** Override the subcategory's default base shape. */
  baseOverride?: BaseShape;
  /** Seed/demo rows are flagged so they can be hidden or purged. */
  isDemo: boolean;
  createdAt: string;
}

/** A buildable spot in a town. `businessId` null = unclaimed. */
export interface Plot {
  id: string;
  townId: string;
  districtId: DistrictId;
  /** World ground position (km). */
  position: Vec2;
  /** Rotation (radians) so the front faces the street. */
  rotation: number;
  businessId: string | null;
}

/** Business as the map needs it: joined with live promo info. */
export interface MapBusiness extends Business {
  activePromoCount: number;
}
