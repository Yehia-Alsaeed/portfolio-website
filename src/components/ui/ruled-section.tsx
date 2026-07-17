import type * as React from "react";

export type RuledSectionProps = {
  title: string;
  meta?: string;
  headingLevel?: 2 | 3;
  children: React.ReactNode;
};

export function RuledSection({ children, headingLevel = 2, meta, title }: RuledSectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section className="border-b border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-line pb-5 pt-10">
        <Heading className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-dim">
          {title}
        </Heading>
        {meta ? (
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-dim">{meta}</p>
        ) : null}
      </div>
      <div className="pb-10">{children}</div>
    </section>
  );
}
