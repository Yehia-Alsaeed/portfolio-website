import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { PROFILE } from "@/content/profile";
import { CLIENT_WORK, SERVICE_OFFERS, SERVICE_PROCESS, TESTIMONIALS } from "@/content/services";
import { ClientWorkGrid } from "@/features/services/client-work-grid";
import { OfferGrid } from "@/features/services/offer-grid";
import { ProcessSection } from "@/features/services/process-section";
import { Testimonials } from "@/features/services/testimonials";

export function ServicesPage() {
  return (
    <>
      <PageTitle
        subtitle="Available for select freelance projects."
        title="I build stores & software that ship."
      />

      <OfferGrid offers={SERVICE_OFFERS} />

      <ProcessSection steps={SERVICE_PROCESS} />

      <RuledSection meta={`${CLIENT_WORK.length} client builds`} title="Client work">
        <ClientWorkGrid entries={CLIENT_WORK} />
      </RuledSection>

      <Testimonials items={TESTIMONIALS} />

      <RuledSection title="Start a project">
        <div className="flex flex-wrap gap-4">
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
