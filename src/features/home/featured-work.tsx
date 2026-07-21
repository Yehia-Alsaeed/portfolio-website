import type { Route } from "next";
import Link from "next/link";
import { ProjectRow } from "@/components/ui/project-row";
import { RuledSection } from "@/components/ui/ruled-section";
import { FEATURED_PROJECTS } from "@/content/homepage";

export function FeaturedWork() {
  return (
    <RuledSection id="work" meta="2025 - 2026" title="Index - Selected work">
      <div className="border-line border-t-2">
        {FEATURED_PROJECTS.map((project) => (
          // The case-study routes are typed-checked against the live route
          // set at build time (matching page-transition.tsx and
          // command-palette-panel.tsx), so asserting Route here is safe.
          <ProjectRow {...project} href={project.href as Route} key={project.name} />
        ))}
        <Link
          className="text-dim hover:bg-accent hover:text-accent-ink border-line flex min-h-14 items-center justify-center border-b px-4 font-mono text-xs tracking-[0.1em] uppercase no-underline transition-colors"
          href="/projects"
        >
          View all 17 projects
        </Link>
      </div>
    </RuledSection>
  );
}
