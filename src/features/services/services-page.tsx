import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { PROFILE } from "@/content/profile";
import { CLIENT_WORK, SERVICE_OFFERS, SERVICE_PROCESS, TESTIMONIALS } from "@/content/services";
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
        <div className="border-line grid grid-cols-1 border-t border-l min-[700px]:grid-cols-3">
          {CLIENT_WORK.map((entry) => (
            <article className="border-line border-r border-b p-6" key={entry.name}>
              <h3 className="text-lg font-bold">{entry.name}</h3>
              <p className="text-dim mt-2 text-sm leading-relaxed">{entry.contribution}</p>
              <a
                className="text-accent-text mt-4 inline-block font-mono text-xs font-bold tracking-[0.1em] uppercase"
                href={entry.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open {entry.name} ↗
              </a>
            </article>
          ))}
        </div>
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
