import Link from "next/link";

import { RuledSection } from "@/components/ui/ruled-section";
import { SERVICE_TEASERS } from "@/content/homepage";

export function ServicesTeaser() {
  return (
    <RuledSection
      id="services"
      meta="Shopify stores + custom websites"
      title="Services - Freelance"
    >
      <div className="border-line border-b-2">
        <div className="grid min-[821px]:grid-cols-2">
          {SERVICE_TEASERS.map((service) => (
            <Link
              className="border-line hover:bg-soft block border-b p-8 no-underline transition-colors last:border-b-0 min-[821px]:border-r min-[821px]:border-b-0 min-[821px]:last:border-r-0 md:p-10"
              href="/services"
              key={service.index}
            >
              <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
                {service.index} / {service.label}
              </p>
              <h3 className="my-3 text-[clamp(1.5rem,3vw,2.375rem)] leading-tight font-extrabold font-stretch-[110%]">
                {service.title}
              </h3>
              <p className="text-dim max-w-[460px] text-[0.9375rem]">{service.summary}</p>
              <ul className="mt-4 list-none p-0 font-mono text-xs leading-7">
                {service.capabilities.map((capability) => (
                  <li className="pl-[3ch] -indent-[3ch]" key={capability}>
                    <span aria-hidden="true" className="text-accent-text">
                      -&gt;{" "}
                    </span>
                    {capability}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* The lowest-commitment way in, teased here so an owner with a site
            that already exists doesn't assume the page is only for new builds. */}
        <div className="border-line flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t px-8 py-5 md:px-10">
          <p className="max-w-[60ch] text-[0.9375rem] leading-relaxed">
            Already have a website that isn&apos;t bringing in customers? I fix those too.
          </p>
          <Link
            className="text-accent-text ml-auto font-mono text-xs font-bold tracking-[0.1em] uppercase no-underline hover:underline"
            href="/services#fix"
          >
            Fixes and redesigns -&gt;
          </Link>
        </div>

        <Link
          className="text-dim hover:bg-accent hover:text-accent-ink border-line flex min-h-14 items-center justify-center border-t px-4 font-mono text-xs tracking-[0.1em] uppercase no-underline transition-colors"
          href="/services"
        >
          All services
        </Link>
      </div>
    </RuledSection>
  );
}
