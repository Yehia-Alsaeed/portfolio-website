import { MetadataRow } from "@/components/ui/metadata-row";
import { PROFILE } from "@/content/profile";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";

export function MonogramHero() {
  return (
    <section aria-labelledby="home-title" id="monogram">
      <h1 className="border-line grid grid-cols-2 items-end border-b-2 pt-5 text-[clamp(7.5rem,22vw,20rem)] leading-[0.76] font-black tracking-normal font-stretch-[125%]" id="home-title">
        <span aria-hidden="true">Y</span>
        <span aria-hidden="true" className="text-right">A<span className="text-accent-text">.</span></span>
        <span className="sr-only">{PROFILE.name}</span>
      </h1>
      <MetadataRow ariaLabel="Profile summary" items={[
        { label: "Role", value: PROFILE.role },
        { label: "Base", value: PROFILE.location },
        { label: "Status", value: PROFILE.status },
        { label: "Display", value: <ModeSwitcher /> },
      ]} />
    </section>
  );
}
