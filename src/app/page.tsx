import { MetadataRow } from "@/components/ui/metadata-row";
import { PageTitle } from "@/components/ui/page-title";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";

export default function HomePage() {
  return (
    <>
      <PageTitle subtitle="AI/ML Engineer and Web Developer" title="Yehia Alsaeed" />
      <MetadataRow
        ariaLabel="Profile summary"
        items={[
          { label: "Role", value: "AI/ML Engineer + Web Dev" },
          { label: "Base", value: "Cairo, Egypt" },
          { label: "Status", value: "Open to roles and clients" },
          { label: "Display", value: <ModeSwitcher /> },
        ]}
      />
    </>
  );
}
