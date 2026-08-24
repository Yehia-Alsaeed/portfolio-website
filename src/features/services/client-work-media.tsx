"use client";

import Image from "next/image";
import * as React from "react";

import type { ClientWorkMediaSet } from "@/content/services";

/**
 * Where a device PNG's screen cut-out sits inside the image, as a share of the
 * full frame. Measured once per PNG: open it, read the transparent region's
 * bounds, and express them as percentages. `screenRatio` is the shape of the
 * capture that fills that cut-out - 16:10 for a MacBook panel.
 */
export type DeviceFrameSpec = {
  src: string;
  alt: string;
  frameRatio: string;
  screenRatio: string;
  screenWidth: string;
  screenTop: string;
};

/**
 * Measured off the shipped 1600x1022 PNG by flood-filling its alpha channel
 * from the borders and taking the bounds of the transparent region left
 * inside: x 190-1409, y 80-869 at that size. The cut-out is centred
 * horizontally, so the screen is placed from its midpoint at `screenTop`.
 * Re-measure all four values if that PNG is ever replaced.
 */
export const MACBOOK_PRO_16: DeviceFrameSpec = {
  alt: "",
  frameRatio: "1600 / 1022",
  screenRatio: "1220 / 790",
  screenTop: "46.48%",
  screenWidth: "76.25%",
  src: "/media/devices/macbook-pro-16.png",
};

export type ClientWorkMediaProps = {
  name: string;
  media: ClientWorkMediaSet;
  /** Omit to show the capture bare, in its own well, with no device around it. */
  frame?: DeviceFrameSpec | undefined;
};

// next/image's `StaticImageData` shape only exists after a real Next.js
// build; under Vitest the same import resolves to a plain URL string, so
// this normalizes both instead of assuming the object shape everywhere.
function resolveImageSrc(image: ClientWorkMediaSet["desktop"]["src"]): string {
  return typeof image === "string" ? image : image.src;
}

export function ClientWorkMedia({ frame, media, name }: ClientWorkMediaProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [recordingFailed, setRecordingFailed] = React.useState(false);
  const descriptionId = React.useId();
  const poster = resolveImageSrc(media.desktop.src);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reduced-motion visitors keep the poster frame: with no controls rendered,
    // a paused video is the only honest resting state we can offer them. Both
    // APIs are feature-detected so the poster is the graceful floor wherever
    // they are missing, rather than a thrown effect that blanks the card.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.4 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  // The captures are recorded at 1220x790 - the laptop cut-out's own ratio -
  // so `cover` is an exact fit: nothing is cropped and no band is left over.
  // If the device PNG is ever replaced, re-record at the new cut-out size
  // rather than reaching for `contain`, which letterboxes inside the screen.
  const screen = recordingFailed ? (
    <Image
      alt={media.desktop.alt}
      className="h-full w-full object-cover"
      height={790}
      src={media.desktop.src}
      width={1220}
    />
  ) : (
    <video
      aria-describedby={descriptionId}
      className="h-full w-full object-cover"
      loop
      muted
      onError={() => setRecordingFailed(true)}
      playsInline
      poster={poster}
      preload="metadata"
      ref={videoRef}
    >
      <source src={media.recording.src} type="video/webm" />
    </video>
  );

  return (
    <figure className="m-0">
      {frame ? (
        <div className="relative w-full" style={{ aspectRatio: frame.frameRatio }}>
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white"
            style={{
              aspectRatio: frame.screenRatio,
              top: frame.screenTop,
              width: frame.screenWidth,
            }}
          >
            {screen}
          </div>
          <Image
            alt={frame.alt}
            aria-hidden="true"
            className="pointer-events-none object-contain"
            fill
            sizes="(min-width: 860px) 600px, 100vw"
            src={frame.src}
          />
        </div>
      ) : (
        <div
          className="border-line relative w-full overflow-hidden border bg-white"
          style={{ aspectRatio: "16 / 10" }}
        >
          {screen}
        </div>
      )}

      <figcaption className="sr-only" id={descriptionId}>
        {name}: {media.recording.description}
      </figcaption>
    </figure>
  );
}
