import Image from "next/image";

import { buildCloudinaryImageUrl } from "@/features/media/cloudinary";
import { LOCAL_FALLBACK_IMAGES } from "@/features/media/local-fallbacks";

export type ProjectImageProps = {
  publicId: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

/**
 * Renders Cloudinary delivery (proxied through Next's own image optimizer,
 * scoped by the `next.config.ts` remote pattern) when a validated cloud name
 * is configured, otherwise the approved local fallback. Both branches read
 * their layout dimensions from the same statically imported asset, so there
 * is never a client-side loading/error state machine to manage.
 */
export function ProjectImage({ alt, priority = false, publicId, sizes }: ProjectImageProps) {
  const fallback = LOCAL_FALLBACK_IMAGES[publicId];
  if (!fallback) return null;

  const cloudinaryUrl = buildCloudinaryImageUrl(publicId);
  if (cloudinaryUrl) {
    return (
      <Image
        alt={alt}
        className="border-line h-auto w-full border"
        height={fallback.height}
        priority={priority}
        sizes={sizes}
        src={cloudinaryUrl}
        width={fallback.width}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className="border-line h-auto w-full border"
      priority={priority}
      sizes={sizes}
      src={fallback}
    />
  );
}
