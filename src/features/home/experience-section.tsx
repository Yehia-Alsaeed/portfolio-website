import { RuledSection } from "@/components/ui/ruled-section";
import { SKILL_GROUPS, TIMELINE_ENTRIES } from "@/content/homepage";

export function ExperienceSection() {
  return (
    <RuledSection id="experience" meta="Cairo, Egypt" title="About - Experience and education">
      <div className="border-line border-t-2">
        {TIMELINE_ENTRIES.map((entry) => (
          <article
            className="border-line grid gap-3 border-b px-1 py-5 min-[821px]:grid-cols-[150px_1.1fr_1.6fr] min-[821px]:gap-[18px]"
            key={entry.title}
          >
            <p className="text-dim font-mono text-xs uppercase">{entry.period}</p>
            <h3 className="text-lg leading-tight font-extrabold font-stretch-[110%]">
              {entry.title}
              <span className="text-accent-text mt-1 block font-mono text-[0.6875rem] font-normal tracking-[0.08em] uppercase">
                {entry.meta}
              </span>
            </h3>
            <p className="text-dim text-[0.9375rem]">{entry.summary}</p>
          </article>
        ))}
      </div>
      <div aria-label="Skills" className="border-line grid border-b-2 min-[821px]:grid-cols-3">
        {SKILL_GROUPS.map((group) => (
          <section
            className="border-line border-b p-6 last:border-b-0 min-[821px]:border-r min-[821px]:border-b-0 min-[821px]:last:border-r-0"
            key={group.label}
          >
            <h3 className="text-dim mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              {group.label}
            </h3>
            <p className="text-[0.9375rem] leading-7 font-semibold">{group.skills.join(" - ")}</p>
          </section>
        ))}
      </div>
    </RuledSection>
  );
}
