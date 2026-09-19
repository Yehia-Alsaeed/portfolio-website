import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og/render-og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Services | Yehia Alsaeed";

export default async function Image() {
  return renderOgImage({
    eyebrow: "Services",
    subtitle:
      "Freelance web developer in Egypt building Shopify stores and custom websites that bring in more orders and new clients. Yehia Alsaeed, Cairo.",
    title: "Websites that make your business more money.",
  });
}
