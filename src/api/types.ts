/**
 * The one interface the whole app talks to. Adapters (mock, Supabase)
 * implement it; UI and game code never import an adapter directly.
 */
import type { District, DistrictId, Landmark, Town } from '@/types/geo';
import type {
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

export type UnlockResult = { ok: true; item: WalletItem; already: boolean; awards: Award[] } | { ok: false; error: UnlockError };

export interface WorldData {
  districts: District[];
  towns: Town[];
  landmarks: Landmark[];
  categories: Category[];
  subcategories: Subcategory[];
}

export interface HeapsparkApi {
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
  progress: {
    /** Points, ledger, passport stamps and badges (player, or local guest). */
    get(): Promise<Progress>;
    /** Daily-visit points (once per Mauritius day). */
    dailyVisit(): Promise<Award[]>;
    /** Stamp the passport + points the first time a district is explored. */
    visitDistrict(districtId: DistrictId): Promise<Award[]>;
  };
  events: {
    /** Fire-and-forget interaction tracking (views, card opens, clicks). */
    track(type: AnalyticsEventType, businessId: string): void;
    /** Totals per event type for a business (business stats, step g). */
    summary(businessId: string): Promise<EventSummary>;
  };
}
