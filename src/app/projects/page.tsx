import type { Metadata } from "next";
import { Suspense } from "react";

import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { getProjectCatalogue } from "@/features/projects/catalogue";
import { ProjectFilters } from "@/features/projects/project-filters";

export const metadata: Metadata = {
  title: "Projects | Yehia Alsaeed",
  description:
    "All 17 GitHub projects by Yehia Alsaeed across AI, machine learning, and full-stack systems, filterable by category.",
};

export default async function ProjectsPage() {
  const projects = await getProjectCatalogue();

  const count = `${projects.length}`;

  return (
    <>
      <PageTitle
        accent={count}
        subtitle="Auto-synced from github.com/Yehia-Alsaeed · categorized by topic · flagships link to case studies"
        title={`All ${count} projects`}
      />
      <RuledSection meta={`${count} total`} title="Project index">
        <Suspense>
          <ProjectFilters projects={projects} />
        </Suspense>
      </RuledSection>
    </>
  );
}
