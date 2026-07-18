export type StatCellProps = { label: string; value: string; detail?: string };

export function StatCell({ detail, label, value }: StatCellProps) {
  return (
    <div className="group hover:bg-accent hover:text-accent-ink px-[22px] pt-[26px] pb-[22px] transition-colors">
      <p className="font-mono text-[clamp(1.75rem,3.4vw,2.875rem)] leading-none font-bold tabular-nums">
        {value}
      </p>
      <p className="text-dim group-hover:text-accent-ink mt-2.5 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {label}
      </p>
      {detail ? (
        <p className="text-dim group-hover:text-accent-ink mt-1 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
          {detail}
        </p>
      ) : null}
    </div>
  );
}
