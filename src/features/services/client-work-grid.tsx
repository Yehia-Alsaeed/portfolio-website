import { CLIENT_WORK_MEDIA, type ClientWork } from "@/content/services";
import { TrackedAnchor } from "@/features/analytics/tracked-anchor";
import { ClientWorkMedia, MACBOOK_PRO_16 } from "@/features/services/client-work-media";

export type ClientWorkGridProps = {
  entries: readonly ClientWork[];
  /**
   * Wrap each capture in the laptop PNG, with the recording playing through
   * its transparent screen cut-out. Pass `false` to show captures bare, in a
   * plain ruled well.
   */
  framed?: boolean;
};

export function ClientWorkGrid({ entries, framed = true }: ClientWorkGridProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 min-[860px]:grid-cols-2">
      {entries.map((entry) => (
        <article className="border-line border p-6 md:p-8" key={entry.name}>
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
                {entry.sector}
              </p>
              <h3 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] font-extrabold tracking-tight font-stretch-[110%]">
                {entry.name}
              </h3>
            </div>

            <TrackedAnchor
              aria-label={`Open ${entry.name}`}
              className="border-line hover:bg-ink hover:text-paper inline-flex h-11 w-11 flex-none items-center justify-center border text-lg transition-colors"
              href={entry.url}
              rel="noopener noreferrer"
              target="_blank"
              tracking={{ type: "outbound_click", destination: entry.trackingId }}
            >
              <span aria-hidden="true">↗</span>
            </TrackedAnchor>
          </header>

          {entry.presentation === "captured" ? (
            <div className="mb-6">
              <ClientWorkMedia
                frame={framed ? MACBOOK_PRO_16 : undefined}
                media={CLIENT_WORK_MEDIA[entry.mediaKey]}
                name={entry.name}
              />
            </div>
          ) : null}

          <p className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
            {entry.kind}
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed">{entry.contribution}</p>
        </article>
      ))}
    </div>
  );
}
