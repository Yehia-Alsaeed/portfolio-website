import { cn } from "@/lib/utils";

export type StatCellProps = {
  label: string;
  value: string;
  detail?: string;
  adaptiveValue?: boolean;
};

export function StatCell({ adaptiveValue = false, detail, label, value }: StatCellProps) {
  const valueLength = value.replace(/\s+/g, " ").trim().length;

  return (
    <div
      className={cn(
        "group hover:bg-accent hover:text-accent-ink h-full min-w-0 transition-colors",
        adaptiveValue
          ? "px-3.5 pt-4 pb-4 min-[768px]:px-[22px] min-[768px]:pt-[26px] min-[768px]:pb-[22px] min-[1200px]:px-6"
          : "px-[22px] pt-[26px] pb-[22px]",
      )}
    >
      <p
        className={cn(
          "font-mono font-bold [text-wrap:balance] [overflow-wrap:anywhere] tabular-nums",
          adaptiveValue && valueLength > 24
            ? "text-[clamp(1rem,4vw,1.75rem)] leading-[1.08]"
            : adaptiveValue && valueLength > 12
              ? "text-[clamp(1.125rem,4.8vw,2.125rem)] leading-[1.05]"
              : adaptiveValue
                ? "text-[clamp(1.75rem,7.8vw,3.25rem)] leading-none"
                : "text-[clamp(1.75rem,3.4vw,2.875rem)] leading-none",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-dim group-hover:text-accent-ink mt-2.5 font-mono [overflow-wrap:anywhere] uppercase",
          adaptiveValue
            ? "text-[0.5625rem] leading-[1.5] tracking-[0.07em] min-[768px]:text-[0.625rem] min-[768px]:tracking-[0.1em]"
            : "text-[0.625rem] tracking-[0.1em]",
        )}
      >
        {label}
      </p>
      {detail ? (
        <p
          className={cn(
            "text-dim group-hover:text-accent-ink mt-1 font-mono [overflow-wrap:anywhere] uppercase",
            adaptiveValue
              ? "text-[0.5625rem] leading-[1.5] tracking-[0.07em] min-[768px]:text-[0.625rem] min-[768px]:tracking-[0.1em]"
              : "text-[0.625rem] tracking-[0.1em]",
          )}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}
