import type * as React from "react";

export type RuledSectionProps = {
  title: string;
  meta?: string;
  headingLevel?: 2 | 3;
  id?: string;
  children: React.ReactNode;
};

export function RuledSection({ children, headingLevel = 2, id, meta, title }: RuledSectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section className="border-line border-b" id={id}>
      <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-t-2 pt-10 pb-5">
        <Heading className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
          {title}
        </Heading>
        {meta ? (
          <p className="text-dim font-mono text-[0.6875rem] tracking-[0.14em] uppercase">{meta}</p>
        ) : null}
      </div>
      <div className="pb-10">{children}</div>
    </section>
  );
}
