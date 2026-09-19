import Link from "next/link";

import { archivoStatement } from "@/app/fonts";
import { Button } from "@/components/ui/button";

/**
 * Client-first statement: what Yehia builds and what the client gets out of
 * it, in plain words, with the search phrase in the first sentence. The AI/ML
 * line stays as a quieter second sentence, and the recruiter path sits on the
 * right of the action row so it's findable without competing with the two
 * client buttons on the left.
 */
export function PositioningSection() {
  return (
    <section
      aria-labelledby="positioning-title"
      className="border-line border-b py-14 md:py-16"
      id="positioning"
    >
      <h2 className="sr-only" id="positioning-title">
        Freelance web developer in Egypt
      </h2>
      <p
        className={`${archivoStatement.className} text-[clamp(1.75rem,4.2vw,3.375rem)] leading-[1.1] font-[650] min-[1024px]:text-[clamp(2rem,3.2vw,3.375rem)] min-[1024px]:text-balance`}
      >
        I&apos;m a freelance web developer in Egypt. I build{" "}
        <mark className="bg-accent text-accent-ink px-[0.16em]">Shopify stores</mark> and websites
        that bring businesses{" "}
        <mark className="bg-accent text-accent-ink px-[0.16em]">more customers</mark>.
      </p>

      {/* One ruled action row under the statement: client buttons on the left,
          recruiter link on the right. Phones stack it, buttons full width. */}
      <div className="border-line mt-10 flex flex-col gap-5 border-t pt-6 min-[560px]:flex-row min-[560px]:flex-wrap min-[560px]:items-center min-[560px]:justify-between">
        <div className="flex flex-col gap-3 min-[560px]:flex-row">
          <Button asChild className="w-full min-[560px]:w-auto">
            <a href="#client-work">See client work</a>
          </Button>
          <Button asChild className="w-full min-[560px]:w-auto" variant="outline">
            <Link href="/services">See all services</Link>
          </Button>
        </div>
        {/* Centred on its own row on phones; from 560px it keeps to the right
            edge whether it shares the row with the buttons or wraps under
            them, so a wrap never leaves it stranded at the left. */}
        <a
          className="text-dim hover:text-ink inline-flex min-h-11 w-full items-center justify-center font-mono text-xs font-bold tracking-[0.1em] uppercase no-underline transition-colors min-[560px]:ml-auto min-[560px]:w-auto"
          href="#work"
        >
          View AI/ML projects
          <span aria-hidden="true" className="text-accent-text ml-2">
            -&gt;
          </span>
        </a>
      </div>
    </section>
  );
}
