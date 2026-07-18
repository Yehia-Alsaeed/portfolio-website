import type * as React from "react";

export type MetadataItem = { label: string; value: React.ReactNode };

export type MetadataRowProps = { items: readonly MetadataItem[]; ariaLabel?: string };

export function MetadataRow({ ariaLabel, items }: MetadataRowProps) {
  return (
    <dl
      aria-label={ariaLabel}
      className="border-line grid grid-cols-2 gap-x-5 gap-y-4 border-b pt-3.5 pb-[18px] font-mono text-[0.6875rem] tracking-[0.06em] uppercase min-[821px]:grid-cols-4"
    >
      {items.map((item) => (
        <div className="min-w-0" key={item.label}>
          <dt className="text-dim mb-0.5">{item.label}</dt>
          <dd className="text-ink m-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
