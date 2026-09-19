import { RuledSection } from "@/components/ui/ruled-section";
import { VISIBLE_CLIENT_WORK } from "@/content/services";
import { ClientWorkGrid } from "@/features/services/client-work-grid";

/**
 * The same live-site cards the services page shows, placed on the homepage
 * right after the statement so a client sees real stores before anything
 * about AI. Reads VISIBLE_CLIENT_WORK for the same reason the services page
 * does: hidden entries stay hidden here too.
 */
export function ClientWorkSection() {
  return (
    <RuledSection
      id="client-work"
      meta={`${VISIBLE_CLIENT_WORK.length} live sites`}
      title="Client work"
    >
      <ClientWorkGrid entries={VISIBLE_CLIENT_WORK} />
    </RuledSection>
  );
}
