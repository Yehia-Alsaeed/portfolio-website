import { PROFILE } from "@/content/profile";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og/render-og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = `${PROFILE.name} - ${PROFILE.role}`;

export default async function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    subtitle: PROFILE.role,
    title: PROFILE.name,
  });
}
