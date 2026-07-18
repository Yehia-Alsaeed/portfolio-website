import Link from "next/link";
import { ProjectRow } from "@/components/ui/project-row";
import { RuledSection } from "@/components/ui/ruled-section";
import { FEATURED_PROJECTS } from "@/content/homepage";

export function FeaturedWork() {
  return (
    <RuledSection meta="2025 - 2026" title="Index - Selected work">
      <div className="border-line border-t-2" id="work">
        {FEATURED_PROJECTS.map((project) => <ProjectRow {...project} key={project.name} />)}
        <Link className="text-dim hover:bg-accent hover:text-accent-ink border-line flex min-h-14 items-center justify-center border-b px-4 font-mono text-xs tracking-[0.1em] uppercase no-underline transition-colors" href="/projects">View all 17 projects</Link>
      </div>
    </RuledSection>
  );
}
