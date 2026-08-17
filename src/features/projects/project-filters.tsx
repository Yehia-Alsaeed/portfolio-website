"use client";

import * as React from "react";

import { ProjectCard } from "@/features/projects/project-card";
import {
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategorySlug,
} from "@/features/projects/model";
import { cn } from "@/lib/utils";

export type ProjectFiltersProps = { projects: readonly Project[] };

const FILTER_CHIPS = [{ label: "All", slug: "all" }, ...PROJECT_CATEGORIES] as const;
type FilterSlug = (typeof FILTER_CHIPS)[number]["slug"];

function isFilterSlug(value: string | null): value is ProjectCategorySlug {
  return FILTER_CHIPS.some((chip) => chip.slug === value);
}

function parseCategoryParam(value: string | null): FilterSlug {
  return isFilterSlug(value) ? value : "all";
}

const CATEGORY_CHANGE_EVENT = "projects:category-change";

function readCategoryParam(): FilterSlug {
  return parseCategoryParam(new URLSearchParams(window.location.search).get("category"));
}

function writeCategoryParam(slug: FilterSlug) {
  const url = new URL(window.location.href);
  if (slug === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", slug);
  const query = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${query ? `?${query}` : ""}`);
  // history.replaceState never fires popstate, so the store subscribers
  // below need an explicit nudge to re-read the URL after a filter click.
  window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
}

function subscribeToCategoryParam(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(CATEGORY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(CATEGORY_CHANGE_EVENT, onStoreChange);
  };
}

function getServerCategorySnapshot(): FilterSlug {
  return "all";
}

export function ProjectFilters({ projects }: ProjectFiltersProps) {
  // useSyncExternalStore (not useState+useEffect) so server and the first
  // client paint both render the complete, unfiltered catalogue - avoiding
  // both a hydration mismatch and the client-only Suspense deferral that
  // useSearchParams() would force onto this static route.
  const activeCategory = React.useSyncExternalStore(
    subscribeToCategoryParam,
    readCategoryParam,
    getServerCategorySnapshot,
  );

  const railRef = React.useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = React.useState({ end: false, start: false });

  const syncOverflow = React.useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    const remaining = rail.scrollWidth - rail.clientWidth - rail.scrollLeft;
    setOverflow({ end: remaining > 1, start: rail.scrollLeft > 1 });
  }, []);

  // ResizeObserver fires once as soon as it starts observing, which covers the
  // initial measurement without calling setState straight from the effect body.
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(rail);
    rail.addEventListener("scroll", syncOverflow, { passive: true });
    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", syncOverflow);
    };
  }, [syncOverflow]);

  // A deep link like ?category=dist would otherwise leave its chip parked off
  // the right-hand edge. Nudging scrollLeft directly rather than calling
  // scrollIntoView keeps the page itself from jumping on load.
  React.useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>('[data-active="true"]');
    if (!rail || !chip) {
      return;
    }
    const chipEnd = chip.offsetLeft + chip.offsetWidth;
    if (chip.offsetLeft < rail.scrollLeft) {
      rail.scrollLeft = chip.offsetLeft - 12;
    } else if (chipEnd > rail.scrollLeft + rail.clientWidth) {
      rail.scrollLeft = chipEnd - rail.clientWidth + 12;
    }
  }, [activeCategory]);

  function selectCategory(slug: FilterSlug) {
    writeCategoryParam(slug);
  }

  const visibleProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* Seven chips total 929px of content, so they only ever fit one row from
          about 1150px up - below `xl` they wrapped to two rows on tablet and
          three on a phone. Here they run as a single scrollable rail instead,
          and revert to the original wrapping row at `xl`, where they already
          fit. */}
      <div className="relative xl:static">
        <div
          aria-label="Filter by category"
          className="filter-rail flex items-center gap-2 overflow-x-auto xl:flex-wrap xl:overflow-x-visible"
          ref={railRef}
          role="group"
        >
          {FILTER_CHIPS.map((chip) => (
            <button
              aria-pressed={activeCategory === chip.slug}
              className={cn(
                "border-line inline-flex min-h-11 shrink-0 cursor-pointer items-center border px-3 font-mono text-[0.6875rem] tracking-[0.08em] uppercase transition-colors",
                activeCategory === chip.slug
                  ? "bg-ink text-paper"
                  : "text-dim hover:bg-ink hover:text-paper",
              )}
              data-active={activeCategory === chip.slug}
              key={chip.slug}
              onClick={() => {
                selectCategory(chip.slug);
              }}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* The rail hides its scrollbar, so these carry the "there is more"
            signal. They only appear on the side that actually has more to
            reach, and never at `xl`, where nothing scrolls. */}
        <div
          aria-hidden="true"
          className={cn(
            "from-paper pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent transition-opacity xl:hidden",
            overflow.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "from-paper pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent transition-opacity xl:hidden",
            overflow.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      {/* The visible "17 projects" counter that used to sit at the end of the
          filter row is gone by request. The live region stays so a filter
          click is still announced - it just never renders anything visible. */}
      <p aria-live="polite" className="sr-only" role="status">
        {visibleProjects.length} project{visibleProjects.length === 1 ? "" : "s"}
      </p>

      {visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2 min-[1200px]:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-dim border-line border-t-2 pt-10 text-sm" role="status">
          No projects in this category yet — try a different filter.
        </p>
      )}
    </div>
  );
}
