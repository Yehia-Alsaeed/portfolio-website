export type PageTitleProps = {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  headingLevel?: 1 | 2;
};

function renderAccentedTitle(title: string, accent?: string) {
  if (!accent) {
    return title;
  }
  const start = title.indexOf(accent);
  if (start === -1) {
    return title;
  }
  return (
    <>
      {title.slice(0, start)}
      <span className="text-accent-text">{accent}</span>
      {title.slice(start + accent.length)}
    </>
  );
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
      <Heading className="text-[clamp(2.75rem,8vw,6.875rem)] leading-[0.95] font-black font-stretch-[120%]">
        {renderAccentedTitle(title, accent)}
      </Heading>
      {subtitle ? (
        <p className="text-dim mt-3.5 font-mono text-xs tracking-[0.1em] uppercase">{subtitle}</p>
      ) : null}
    </header>
  );
}
