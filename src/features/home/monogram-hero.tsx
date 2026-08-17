import { MetadataRow } from "@/components/ui/metadata-row";
import { archivoWide } from "@/app/fonts";
import { PROFILE } from "@/content/profile";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";

import styles from "./home.module.css";

export function MonogramHero() {
  return (
    <section aria-labelledby="home-title" id="monogram">
      <h1
        className={`${archivoWide.className} ${styles.monogram} border-line grid grid-cols-2 items-end border-b-2 pt-5 text-[clamp(7.5rem,22vw,20rem)] leading-[0.76] font-black tracking-normal font-stretch-[125%]`}
        data-testid="kinetic-monogram"
        id="home-title"
      >
        <span aria-hidden="true" className={styles.letterY}>
          Y
        </span>
        <span aria-hidden="true" className={`${styles.letterA} text-right`}>
          A<span className={`${styles.period} text-accent-text`}>.</span>
        </span>
        <span className="sr-only">{PROFILE.name}</span>
      </h1>
      {/* Two items on phones (Display is hidden below 768px, see below) and
          three from 768px up, so the row is full at both sizes and never
          leaves a stray item on a line of its own. */}
      <MetadataRow
        ariaLabel="Profile summary"
        columnsClassName="grid-cols-2 md:grid-cols-3"
        items={[
          { label: "Role", value: PROFILE.role },
          { label: "Base", value: PROFILE.location },
          // Below 768px the switcher lives in the mobile menu panel instead
          // (mobile-nav.tsx), which reaches every route rather than just this
          // page. Hidden rather than duplicated so only one ever renders.
          { className: "max-md:hidden", label: "Display", value: <ModeSwitcher /> },
        ]}
      />
    </section>
  );
}
