export type PageTitleProps = { eyebrow?: string; title: string; accent?: string; subtitle?: string };

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
      <span className="text-accent">{accent}</span>
      {title.slice(start + accent.length)}
    </>
  );
}

export function PageTitle({ accent, eyebrow, subtitle, title }: PageTitleProps) {
  return (
    <header className="border-b-2 border-line pb-8 pt-12">
      {eyebrow ? (
        <p className="mb-4 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-[clamp(2.75rem,8vw,6.875rem)] font-black font-stretch-[120%] leading-[0.95]">
        {renderAccentedTitle(title, accent)}
      </h1>
      {subtitle ? (
        <p className="mt-3.5 font-mono text-xs uppercase tracking-[0.1em] text-dim">{subtitle}</p>
      ) : null}
    </header>
  );
}
