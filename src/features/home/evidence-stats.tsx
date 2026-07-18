import { StatCell } from "@/components/ui/stat-cell";
import { HOME_STATS } from "@/content/homepage";

export function EvidenceStats() {
  return (
    <section
      aria-labelledby="stats-title"
      className="border-line grid grid-cols-2 border-b-2 min-[821px]:grid-cols-4"
      id="stats"
    >
      <h2 className="sr-only" id="stats-title">
        Evidence at a glance
      </h2>
      {HOME_STATS.map((stat) => (
        <div
          className="border-line border-r border-b last:border-r-0 min-[821px]:border-b-0"
          key={stat.label}
        >
          <StatCell {...stat} />
        </div>
      ))}
    </section>
  );
}
