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
  events: {
    /** Fire-and-forget interaction tracking (views, card opens, clicks). */
    track(type: AnalyticsEventType, businessId: string): void;
    /** Totals per event type for a business (business stats, step g). */
    summary(businessId: string): Promise<EventSummary>;
  };
}
