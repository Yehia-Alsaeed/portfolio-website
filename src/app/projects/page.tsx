import type { Metadata } from "next";

import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";

export const metadata: Metadata = {
  title: "Projects | Yehia Alsaeed",
  description:
    "Technical projects by Yehia Alsaeed across AI, machine learning, and full-stack systems.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageTitle
        subtitle="Technical work across AI, machine learning, and full-stack systems"
        title="Projects"
      />
      <RuledSection title="Project index">
        <p className="max-w-[62ch] text-base leading-relaxed text-dim">
          AI, computer vision, data, distributed systems, and full-stack engineering.
        </p>
      </RuledSection>
    </>
  );
}
