/**
 * Ad inventory and founding partners. Mirrors the future Supabase tables
 * `ad_slots`, `ad_bookings` and `partners`.
 */
import type { DistrictId, LatLon } from './geo';

export type AdSlotType = 'billboard' | 'townEntrance' | 'airportBanner' | 'busStop' | 'planeBanner' | 'loadingScreen';

/**
 * Where a slot sits on the map:
 *  - road: a fraction `t` (0–1) along a road from `data/roads.ts`, on one side
 *  - town: beside the road at the edge of a town (town entrance / bus stop)
 *  - point: an explicit position (e.g. the airport)
 *  - screen: not on the map (loading screen, plane banner)
 */
export type AdPlacementSpec =
  | { kind: 'road'; roadId: string; t: number; side: 1 | -1 }
  | { kind: 'town'; townId: string }
  | { kind: 'point'; at: LatLon; rotation?: number }
  | { kind: 'screen' };

export interface AdSlot {
  id: string;
  type: AdSlotType;
  name: string;
  districtId?: DistrictId;
  placement: AdPlacementSpec;
  /** Monthly price in Mauritian rupees (0 = set by admin). */
  pricePerMonthRs: number;
}

/** A creative is an uploaded image, or simple text the advertiser typed. */
export type AdCreative =
  | { kind: 'image'; url: string; alt: string }
  | { kind: 'text'; headline: string; sub?: string; bg: string; fg?: string };

export type BookingStatus = 'pending' | 'active' | 'ended' | 'rejected';

export interface AdBooking {
  id: string;
  slotId: string;
  /** Advertiser's business on the map (click flies there), if any. */
  advertiserBusinessId?: string;
  advertiserName: string;
  creative: AdCreative;
  /** External link, used when there is no advertiser business. */
  linkUrl?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  impressions: number;
  clicks: number;
  isDemo: boolean;
}

/** A slot with whatever is running in it today (null = available). */
export interface AdPlacement {
  slot: AdSlot;
  booking: AdBooking | null;
}

export type PartnerType = 'districtFounding' | 'categoryFounding';

/**
 * Founding partner slots, assigned manually by an admin. One per district
 * and one per subcategory. (The Founding Member gold skin for the first 100
 * businesses is a flag on the business itself.)
 */
export interface Partner {
  id: string;
  type: PartnerType;
  businessId: string;
  districtId?: DistrictId;
  subcategoryId?: string;
  assignedAt: string;
  assignedBy: string;
}

/** Partner as the game shows it (joined with the business's name + colour). */
export interface PartnerView extends Partner {
  businessName: string;
  brandColor: string;
}

export const ADVERTISE_URL = 'https://heapspark.com/advertise';
