/**
 * The one interface the whole app talks to. Adapters (mock, Supabase)
 * implement it; UI and game code never import an adapter directly.
 */
import type { District, DistrictId, Landmark, Town } from '@/types/geo';
import type {
  ApprovalStatus,
  Business,
  BusinessInput,
  BusinessStats,
  AnalyticsEventType,
  BusinessDetail,
  Category,
  EventSummary,
  MapBusiness,
  Plot,
  SearchParams,
  Subcategory,
} from '@/types/business';
import type { Award, ContactKind, Progress, Session } from '@/types/player';
import type { LookupResult, RedemptionMethod, UnlockError, WalletItem } from '@/types/promo';

import type { AdBooking, AdPlacement, AdSlot, PartnerType, PartnerView } from '@/types/ads';
import type { Promo, PromoStatus } from '@/types/promo';

export type UnlockResult = { ok: true; item: WalletItem; already: boolean; awards: Award[] } | { ok: false; error: UnlockError };

export interface WorldData {
  districts: District[];
  towns: Town[];
  landmarks: Landmark[];
  categories: Category[];
  subcategories: Subcategory[];
}

/** Fields a business owner can set on a promo. */
export type PromoInput = Pick<Promo, 'title' | 'description' | 'discountType' | 'discountValue' | 'quantityLimit' | 'expiresAt' | 'codeValidDays' | 'rules'> & {
  id?: string;
  businessId: string;
};

export type AdRequest = Pick<AdBooking, 'slotId' | 'creative' | 'startDate' | 'endDate' | 'linkUrl'> & { businessId: string };

export interface AdminOverview {
  businesses: Record<ApprovalStatus, number>;
  foundingMembers: number;
  players: number;
  promos: { pending: number; active: number };
  codes: { unlocked: number; redeemed: number };
  events: EventSummary;
  ads: { booked: number; slots: number; impressions: number; clicks: number };
}

export interface HeapsparkApi {
  /** Notifies when data changes (another tab, an approval…). Returns unsubscribe. */
  subscribe(cb: () => void): () => void;
  geo: {
    /** Everything needed to draw the base map. Fetched once at startup. */
    getWorld(): Promise<WorldData>;
  };
  map: {
    /**
     * Plots + member businesses of one district. The game calls this as
     * the player enters a district, so districts load lazily.
     */
    getDistrict(districtId: DistrictId): Promise<{ plots: Plot[]; businesses: MapBusiness[] }>;
  };
  directory: {
    /** Search approved businesses island-wide. Best matches first. */
    search(params: SearchParams): Promise<MapBusiness[]>;
    /** Full card data for one business (null if unknown/unapproved). */
    getBusiness(id: string): Promise<BusinessDetail | null>;
  };
  auth: {
    getSession(): Promise<Session | null>;
    /**
     * Send a one-time sign-in code by email or SMS. The mock adapter
     * returns it as `demoCode` so it can be shown on screen.
     */
    requestCode(kind: ContactKind, contact: string): Promise<{ demoCode?: string }>;
    /** Verify the code. New players must give a display name and accept the privacy notice. */
    verifyCode(input: { kind: ContactKind; contact: string; code: string; displayName?: string; acceptPrivacy?: boolean }): Promise<Session>;
    signOut(): Promise<void>;
    /** Erase the player's personal data (Data Protection Act right to erasure). */
    deleteAccount(): Promise<void>;
  };
  promos: {
    /** Unlock (or re-show) the signed-in player's unique code for a promo. */
    unlock(promoId: string): Promise<UnlockResult>;
    /** The signed-in player's codes, newest first. */
    wallet(): Promise<WalletItem[]>;
  };
  validation: {
    /** Look a code up at the counter (does not redeem). */
    lookup(businessId: string, code: string): Promise<LookupResult>;
    /** Mark a code as used. Single-use: a second call fails with already-redeemed. */
    redeem(businessId: string, code: string, method: RedemptionMethod): Promise<LookupResult>;
  };
  ads: {
    /** Every ad slot with today's booking (null = available). */
    list(): Promise<AdPlacement[]>;
    /** Count that a slot was shown (once per session per slot). */
    trackImpression(slotId: string): void;
    /** Count a tap on a slot (booked or empty). */
    trackClick(slotId: string): void;
  };
  partners: {
    list(): Promise<PartnerView[]>;
  };
  progress: {
    /** Points, ledger, passport stamps and badges (player, or local guest). */
    get(): Promise<Progress>;
    /** Daily-visit points (once per Mauritius day). */
    dailyVisit(): Promise<Award[]>;
    /** Stamp the passport + points the first time a district is explored. */
    visitDistrict(districtId: DistrictId): Promise<Award[]>;
  };
  business: {
    /** Businesses owned by the signed-in player (any status). */
    mine(): Promise<Business[]>;
    get(id: string): Promise<Business | null>;
    /** Plot ids already taken (approved or awaiting approval). */
    takenPlotIds(): Promise<string[]>;
    /** Claim a plot: creates a business awaiting admin approval. */
    claim(input: BusinessInput): Promise<Business>;
    update(id: string, patch: Partial<BusinessInput>): Promise<Business>;
    promos(businessId: string): Promise<Promo[]>;
    /** Create/edit a promo. New or edited promos go back to admin approval. */
    savePromo(input: PromoInput): Promise<Promo>;
    setPromoPaused(promoId: string, paused: boolean): Promise<void>;
    stats(businessId: string): Promise<BusinessStats>;
    /** Ask to book an ad slot (admin approves). */
    requestAd(req: AdRequest): Promise<AdBooking>;
    bookings(businessId: string): Promise<AdBooking[]>;
    /** Demo only: become the owner of a demo business to try the portal. */
    demoTakeOver?(businessId: string): Promise<void>;
  };
  admin: {
    isAdmin(): Promise<boolean>;
    /** Demo only: grant the signed-in player the admin role. */
    becomeDemoAdmin?(): Promise<void>;
    overview(): Promise<AdminOverview>;
    businesses(): Promise<Business[]>;
    setBusinessStatus(id: string, status: ApprovalStatus, note?: string): Promise<void>;
    setFoundingMember(id: string, on: boolean): Promise<void>;
    removePhoto(id: string, index: number): Promise<void>;
    promos(): Promise<(Promo & { businessName: string })[]>;
    setPromoStatus(id: string, status: PromoStatus): Promise<void>;
    assignPartner(type: PartnerType, key: string, businessId: string | null): Promise<void>;
    slots(): Promise<(AdSlot & { bookings: AdBooking[]; impressions: number; clicks: number })[]>;
    setSlotPrice(slotId: string, pricePerMonthRs: number): Promise<void>;
    saveBooking(b: Omit<AdBooking, 'id' | 'impressions' | 'clicks' | 'isDemo'> & { id?: string }): Promise<AdBooking>;
    setBookingStatus(id: string, status: AdBooking['status']): Promise<void>;
  };
  events: {
    /** Fire-and-forget interaction tracking (views, card opens, clicks). */
    track(type: AnalyticsEventType, businessId: string): void;
    /** Totals per event type for a business (business stats, step g). */
    summary(businessId: string): Promise<EventSummary>;
  };
}
