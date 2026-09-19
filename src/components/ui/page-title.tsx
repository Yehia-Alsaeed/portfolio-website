import type * as React from "react";

export type PageTitleProps = {
  eyebrow?: string;
  title: string;
  /** One phrase, or several; the first occurrence of each is highlighted. */
  accent?: string | readonly string[];
  subtitle?: string;
  headingLevel?: 1 | 2;
};

function renderAccentedTitle(title: string, accent?: string | readonly string[]) {
  const phrases = typeof accent === "string" ? [accent] : (accent ?? []);
  const ranges = phrases
    .filter((phrase) => phrase.length > 0)
    .map((phrase) => {
      const start = title.indexOf(phrase);
      return { end: start + phrase.length, start };
    })
    .filter(({ start }) => start !== -1)
    .sort((left, right) => left.start - right.start);

  if (ranges.length === 0) {
    return title;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const { end, start } of ranges) {
    // An overlapping phrase would split an existing highlight; keep the earlier one.
    if (start < cursor) {
      continue;
    }
    if (start > cursor) {
      nodes.push(title.slice(cursor, start));
    }
    nodes.push(
      <span className="text-accent-text" key={start}>
        {title.slice(start, end)}
      </span>,
    );
    cursor = end;
  }
  if (cursor < title.length) {
    nodes.push(title.slice(cursor));
  }
  return nodes;
}

export function PageTitle({ accent, eyebrow, headingLevel = 1, subtitle, title }: PageTitleProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <header className="border-line border-b-2 pt-12 pb-8">
      {eyebrow ? (
        <p className="text-accent-text mb-4 font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-[clamp(2.75rem,8vw,6.875rem)] leading-[0.95] font-black [overflow-wrap:anywhere] font-stretch-[120%]">
        {renderAccentedTitle(title, accent)}
      </Heading>
      {subtitle ? (
        <p className="text-dim mt-3.5 font-mono text-xs tracking-[0.1em] uppercase">{subtitle}</p>
      ) : null}
    </header>
  );
}
