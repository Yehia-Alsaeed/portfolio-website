import type * as React from "react";

export type MetadataItem = { label: string; value: React.ReactNode };

export type MetadataRowProps = { items: readonly MetadataItem[]; ariaLabel?: string };

export function MetadataRow({ ariaLabel, items }: MetadataRowProps) {
  return (
    <dl
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-line pb-[18px] pt-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] min-[821px]:grid-cols-4"
    >
      {items.map((item) => (
        <div className="min-w-0" key={item.label}>
          <dt className="mb-0.5 text-dim">{item.label}</dt>
          <dd className="m-0 text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
