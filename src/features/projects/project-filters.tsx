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

  function selectCategory(slug: FilterSlug) {
    writeCategoryParam(slug);
  }

  const visibleProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="flex flex-col gap-8">
      <div
        aria-label="Filter by category"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        {FILTER_CHIPS.map((chip) => (
          <button
            aria-pressed={activeCategory === chip.slug}
            className={cn(
              "border-line inline-flex min-h-11 cursor-pointer items-center border px-3 font-mono text-[0.6875rem] tracking-[0.08em] uppercase transition-colors",
              activeCategory === chip.slug
                ? "bg-ink text-paper"
                : "text-dim hover:bg-ink hover:text-paper",
            )}
            key={chip.slug}
            onClick={() => {
              selectCategory(chip.slug);
            }}
            type="button"
          >
            {chip.label}
          </button>
        ))}
        <p
          aria-live="polite"
          className="text-dim ml-auto font-mono text-[0.6875rem] tracking-[0.08em] uppercase"
          role="status"
        >
          {visibleProjects.length} project{visibleProjects.length === 1 ? "" : "s"}
        </p>
      </div>

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
