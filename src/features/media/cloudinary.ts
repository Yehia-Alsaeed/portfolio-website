import { publicEnv } from "@/lib/env/public";

/**
 * Every publicId a case study is allowed to request from Cloudinary, matching
 * docs/content/asset-register.md exactly. Anything outside this set is
 * refused rather than silently proxied through as an unreviewed transform.
 */
export const ALLOWED_MEDIA_PUBLIC_IDS = new Set([
  "skillbridge-interview",
  "skillbridge-results",
  "prestige-home",
  "prestige-collection",
  "pets-fcn",
  "pets-segnet",
  "pets-hrnet",
  "study-planner-architecture",
]);

const CLOUDINARY_DELIVERY_HOST = "res.cloudinary.com";
const MAX_SOURCE_WIDTH = 1600;

/**
 * Builds a Cloudinary delivery URL with fixed, safe transformations
 * (f_auto,q_auto,c_limit,w_<width>). Returns `undefined` whenever any input
 * fails validation, so the caller always has a clear signal to fall back to
 * the local approved asset instead of rendering a malformed/unreviewed URL.
 */
export function buildCloudinaryImageUrl(
  publicId: string,
  width = MAX_SOURCE_WIDTH,
): string | undefined {
  const cloudName = publicEnv.cloudinaryCloudName;
  if (!cloudName) return undefined;
  if (!ALLOWED_MEDIA_PUBLIC_IDS.has(publicId)) return undefined;
  if (!Number.isInteger(width) || width <= 0) return undefined;

  return `https://${CLOUDINARY_DELIVERY_HOST}/${cloudName}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
}
