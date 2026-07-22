"use client";

import Image from "next/image";
import * as React from "react";

import type { ClientWorkMediaSet } from "@/content/services";
import { cn } from "@/lib/utils";

export type ClientWorkMediaProps = { name: string; media: ClientWorkMediaSet };

type Viewport = "desktop" | "mobile";

const VIEWPORT_DIMENSIONS: Record<Viewport, { width: number; height: number }> = {
  desktop: { height: 900, width: 1440 },
  mobile: { height: 844, width: 390 },
};

// next/image's `StaticImageData` shape only exists after a real Next.js
// build; under Vitest the same import resolves to a plain URL string, so
// this normalizes both instead of assuming the object shape everywhere.
function resolveImageSrc(image: ClientWorkMediaSet["desktop"]["src"]): string {
  return typeof image === "string" ? image : image.src;
}

export function ClientWorkMedia({ media, name }: ClientWorkMediaProps) {
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [recordingRequested, setRecordingRequested] = React.useState(false);
  const active = media[viewport];

  return (
    <div className="mt-4">
      <div aria-label={`${name} screenshot viewport`} className="flex gap-2" role="group">
        {(["desktop", "mobile"] as const).map((option) => (
          <button
            aria-pressed={viewport === option}
            className={cn(
              "border-line inline-flex min-h-11 cursor-pointer items-center border px-3 font-mono text-[0.625rem] font-bold tracking-[0.1em] uppercase transition-colors",
              viewport === option ? "bg-ink text-paper" : "text-dim hover:bg-ink hover:text-paper",
            )}
            key={option}
            onClick={() => setViewport(option)}
            type="button"
          >
            {option === "desktop" ? "Desktop" : "Mobile"}
          </button>
        ))}
      </div>

      <Image
        alt={active.alt}
        className="border-line mt-3 h-auto w-full border"
        height={VIEWPORT_DIMENSIONS[viewport].height}
        src={active.src}
        width={VIEWPORT_DIMENSIONS[viewport].width}
      />

      <details
        className="mt-3"
        onToggle={(event) => {
          if (event.currentTarget.open) setRecordingRequested(true);
        }}
      >
        <summary className="min-h-11 cursor-pointer font-mono text-[0.625rem] font-bold tracking-[0.1em] uppercase">
          Watch short recording
        </summary>
        {recordingRequested ? (
          <div className="mt-3">
            <video
              className="border-line w-full border"
              controls
              muted
              playsInline
              poster={resolveImageSrc(media.desktop.src)}
              preload="metadata"
            >
              <source src={media.recording.src} type="video/webm" />
            </video>
            <p className="text-dim mt-2 text-sm leading-relaxed">{media.recording.description}</p>
          </div>
        ) : null}
      </details>
    </div>
  );
}
