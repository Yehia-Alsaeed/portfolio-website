import { RuledSection } from "@/components/ui/ruled-section";
import type { ServiceOffer } from "@/content/services";

export type OfferGridProps = { offers: readonly ServiceOffer[] };

export function OfferGrid({ offers }: OfferGridProps) {
  return (
    <RuledSection title="What I build">
      <div className="border-line grid border-b-2 min-[821px]:grid-cols-2">
        {offers.map((offer) => (
          <div
            className="border-line border-b p-8 last:border-b-0 min-[821px]:border-r min-[821px]:border-b-0 min-[821px]:last:border-r-0 md:p-10"
            key={offer.index}
          >
            <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
              {offer.index} / {offer.label}
            </p>
            <h3 className="my-3 text-[clamp(1.5rem,3vw,2.375rem)] leading-tight font-extrabold font-stretch-[110%]">
              {offer.title}
            </h3>
            <p className="text-dim max-w-[460px] text-[0.9375rem]">{offer.summary}</p>
            <ul className="mt-4 list-none p-0 font-mono text-xs leading-7">
              {offer.capabilities.map((capability) => (
                <li key={capability}>
                  <span aria-hidden="true" className="text-accent-text">
                    -&gt;{" "}
                  </span>
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </RuledSection>
  );
}
