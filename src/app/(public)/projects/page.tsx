import type { Metadata } from "next";

import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { getProjectCatalogue } from "@/features/projects/catalogue";
import { ProjectFilters } from "@/features/projects/project-filters";

export const metadata: Metadata = {
  alternates: { canonical: "/projects" },
  title: "Projects | Yehia Alsaeed",
  description:
    "All projects by Yehia Alsaeed across AI, machine learning, and full-stack systems, with the measured result of each project and filters by category.",
};

export default async function ProjectsPage() {
  const projects = await getProjectCatalogue();

  return (
    <>
      {/* The five flagships sort to the front of the grid, so the strongest
          work leads even though the heading counts everything. The old
          subtitle described the build pipeline ("auto-synced from
          github.com...") and told a reader nothing, so it is gone. */}
      <PageTitle accent="All" title="All projects" />
      <RuledSection meta={`${projects.length} total`} title="Project index">
        <ProjectFilters projects={projects} />
      </RuledSection>
    </>
  );
}
