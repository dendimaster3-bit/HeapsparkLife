/** Shared helpers for building one district's scene. */
import { insideDistrict } from '@/lib/geo';
import type { DistrictId, Vec2 } from '@/types/geo';

/** Predicate: is a point inside the district (with an optional margin in km)? */
export const insideOf = (id: DistrictId, margin = 0) => (p: Vec2) => insideDistrict(p[0], p[1], id, margin);
