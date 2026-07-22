import { CLIENT_WORK_MEDIA, type ClientWork } from "@/content/services";
import { ClientWorkMedia } from "@/features/services/client-work-media";

export type ClientWorkGridProps = { entries: readonly ClientWork[] };

export function ClientWorkGrid({ entries }: ClientWorkGridProps) {
  return (
    <div className="border-line grid grid-cols-1 border-t border-l min-[820px]:grid-cols-3">
      {entries.map((entry) => (
        <article className="border-line border-r border-b p-6" key={entry.name}>
          <h3 className="text-lg font-bold">{entry.name}</h3>
          <p className="text-dim mt-2 text-sm leading-relaxed">{entry.contribution}</p>

          {entry.presentation === "captured" ? (
            <ClientWorkMedia media={CLIENT_WORK_MEDIA[entry.mediaKey]} name={entry.name} />
          ) : null}

          <a
            className="text-accent-text mt-4 inline-block min-h-11 font-mono text-xs font-bold tracking-[0.1em] uppercase"
            href={entry.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open {entry.name} ↗
          </a>
        </article>
      ))}
    </div>
  );
}
