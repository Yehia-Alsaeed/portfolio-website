"use client";

import * as React from "react";

import type { ModelComparison } from "@/content/projects/proof";
import { ProjectImage } from "@/features/media/project-image";
import { cn } from "@/lib/utils";

export type ModelMicroscopeProps = { models: readonly ModelComparison[] };

export function ModelMicroscope({ models }: ModelMicroscopeProps) {
  const [selectedId, setSelectedId] = React.useState(models[0]?.id);
  const active = models.find((model) => model.id === selectedId) ?? models[0];
  if (!active) return null;

  return (
    <div className="mt-8">
      <div aria-label="Select a model" className="flex flex-wrap gap-2" role="group">
        {models.map((model) => (
          <button
            aria-pressed={model.id === active.id}
            className={cn(
              "border-line inline-flex min-h-11 cursor-pointer items-center border px-3 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-colors",
              model.id === active.id
                ? "bg-ink text-paper"
                : "text-dim hover:bg-ink hover:text-paper",
            )}
            key={model.id}
            onClick={() => setSelectedId(model.id)}
            type="button"
          >
            {model.label}
          </button>
        ))}
      </div>

      <div className="border-line mt-4 grid grid-cols-1 border p-4 min-[700px]:grid-cols-[minmax(0,1fr)_260px]">
        <ProjectImage
          alt={`${active.label} predictions beside source and ground truth`}
          publicId={active.imagePublicId}
          sizes="(min-width: 700px) 50vw, 100vw"
        />
        <dl
          aria-live="polite"
          className="mt-4 flex flex-col gap-3 font-mono text-[0.8125rem] min-[700px]:mt-0 min-[700px]:pl-4"
        >
          <div>
            <dt className="text-dim text-[0.625rem] tracking-[0.1em] uppercase">mIoU</dt>
            <dd className="text-lg font-bold">{active.miou}</dd>
          </div>
          <div>
            <dt className="text-dim text-[0.625rem] tracking-[0.1em] uppercase">Inference time</dt>
            <dd>{active.inferenceTime}</dd>
          </div>
          <div>
            <dt className="text-dim text-[0.625rem] tracking-[0.1em] uppercase">Parameters</dt>
            <dd>{active.parameters}</dd>
          </div>
          <div>
            <dt className="text-dim text-[0.625rem] tracking-[0.1em] uppercase">Note</dt>
            <dd className="text-dim text-xs leading-relaxed">{active.note}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
