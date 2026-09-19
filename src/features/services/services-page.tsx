import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { PROFILE } from "@/content/profile";
import {
  FIX_SECTION,
  PROJECT_INCLUDES,
  SERVICE_FAQ,
  SERVICE_OFFERS,
  SERVICE_PROCESS,
  START_PROJECT_INTRO,
  TESTIMONIALS,
  VISIBLE_CLIENT_WORK,
} from "@/content/services";
import { ClientWorkGrid } from "@/features/services/client-work-grid";
import { FaqSection } from "@/features/services/faq-section";
import { FixSection } from "@/features/services/fix-section";
import { OfferGrid } from "@/features/services/offer-grid";
import { ProcessSection } from "@/features/services/process-section";
import { ProjectIncludes } from "@/features/services/project-includes";
import { Testimonials } from "@/features/services/testimonials";

export function ServicesPage() {
  return (
    <>
      <PageTitle
        accent="more money"
        eyebrow="Freelance web developer in Egypt"
        subtitle="Shopify stores - Custom websites - Cairo, clients anywhere"
        title="Websites that make your business more money."
      />

      <OfferGrid offers={SERVICE_OFFERS} />

      <FixSection content={FIX_SECTION} />

      {/*
        Renders VISIBLE_CLIENT_WORK, not CLIENT_WORK: entries flagged `hidden`
        are withheld from the page on purpose and stay in the content module
        awaiting their return. Do not "simplify" this back to CLIENT_WORK.
      */}
      <RuledSection meta={`${VISIBLE_CLIENT_WORK.length} client builds`} title="Client work">
        <ClientWorkGrid entries={VISIBLE_CLIENT_WORK} />
      </RuledSection>

      <Testimonials items={TESTIMONIALS} />

      <ProjectIncludes items={PROJECT_INCLUDES} />

      <ProcessSection steps={SERVICE_PROCESS} />

      <FaqSection items={SERVICE_FAQ} />

      <RuledSection title="Start a project">
        <p className="text-dim max-w-[60ch] text-[0.9375rem] leading-relaxed">
          {START_PROJECT_INTRO}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button asChild variant="primary">
            <Link href="/#contact">Start a conversation</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${PROFILE.email}`}>Email directly</a>
          </Button>
        </div>
      </RuledSection>
    </>
  );
}
