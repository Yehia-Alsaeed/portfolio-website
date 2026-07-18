import Link from "next/link";

import { archivoStatement } from "@/app/fonts";
import { Button } from "@/components/ui/button";

export function PositioningSection() {
  return (
    <section
      aria-labelledby="positioning-title"
      className="border-line max-w-[1040px] border-b py-14 md:py-16"
      id="positioning"
    >
      <h2 className="sr-only" id="positioning-title">
        Professional profile
      </h2>
      <p
        className={`${archivoStatement.className} text-[clamp(1.75rem,4.2vw,3.375rem)] leading-[1.1] font-[650]`}
      >
        Yehia Alsaeed fine-tunes{" "}
        <mark className="bg-accent text-accent-ink px-[0.16em]">language models</mark>, trains
        vision systems, and ships{" "}
        <mark className="bg-accent text-accent-ink px-[0.16em]">full-stack and Shopify</mark>{" "}
        products end-to-end.{" "}
        <span className="text-dim font-normal">
          CS (AI) graduate - British University in Egypt, 2026.
        </span>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <a href="#work">View AI/ML work</a>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">Explore client services</Link>
        </Button>
      </div>
    </section>
  );
}
