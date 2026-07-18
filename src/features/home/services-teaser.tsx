import Link from "next/link";
import { RuledSection } from "@/components/ui/ruled-section";
import { SERVICE_TEASERS } from "@/content/homepage";

export function ServicesTeaser() {
  return (
    <RuledSection
      id="services"
      meta="4 Shopify + 2 full-stack client builds"
      title="Services - Freelance"
    >
      <div className="border-line grid border-b-2 min-[821px]:grid-cols-2">
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
                <li key={capability}>
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
    </RuledSection>
  );
}
