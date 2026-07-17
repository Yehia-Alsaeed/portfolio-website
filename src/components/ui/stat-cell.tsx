export type StatCellProps = { label: string; value: string; detail?: string };

export function StatCell({ detail, label, value }: StatCellProps) {
  return (
    <div className="group px-[22px] pb-[22px] pt-[26px] transition-colors hover:bg-accent hover:text-accent-ink">
      <p className="font-mono text-[clamp(1.75rem,3.4vw,2.875rem)] font-bold tabular-nums leading-none">
        {value}
      </p>
      <p className="mt-2.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-dim group-hover:text-accent-ink">
        {label}
      </p>
      {detail ? (
        <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-dim group-hover:text-accent-ink">
          {detail}
        </p>
      ) : null}
    </div>
  );
}
