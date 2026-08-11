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

export const MACBOOK_PRO_16: DeviceFrameSpec = {
  alt: "",
  frameRatio: "1000 / 568",
  screenRatio: "16 / 10",
  screenTop: "45.3%",
  screenWidth: "79.5%",
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

  const screen = recordingFailed ? (
    <Image
      alt={media.desktop.alt}
      className="h-full w-full object-cover"
      height={900}
      src={media.desktop.src}
      width={1440}
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
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
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
          className="border-line relative w-full overflow-hidden border"
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
