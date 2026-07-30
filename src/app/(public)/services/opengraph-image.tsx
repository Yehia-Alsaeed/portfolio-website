import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og/render-og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Services | Yehia Alsaeed";

export default async function Image() {
  return renderOgImage({
    eyebrow: "Services",
    subtitle:
      "Shopify store builds, full-stack web development, and applied AI services by Yehia Alsaeed. Available for select freelance projects.",
    title: "I build stores & software that ship.",
  });
}
