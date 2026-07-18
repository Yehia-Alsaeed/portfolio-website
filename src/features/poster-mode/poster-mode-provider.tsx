"use client";

import * as React from "react";

export type PosterTemplate = "index" | "metric";
export type PosterModeContextValue = { openPoster: () => void; closePoster: () => void };

const PosterModeDialog = React.lazy(() => import("./poster-mode-dialog"));
const PosterModeContext = React.createContext<PosterModeContextValue | null>(null);

export function nextPosterTemplate(template: PosterTemplate): PosterTemplate {
  return template === "index" ? "metric" : "index";
}

export function PosterModeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const [template, setTemplate] = React.useState<PosterTemplate>("index");

  const openPoster = React.useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);
  const closePoster = React.useCallback(() => setOpen(false), []);
  const value = React.useMemo(() => ({ closePoster, openPoster }), [closePoster, openPoster]);

  return (
    <PosterModeContext.Provider value={value}>
      {children}
      {hasOpened ? (
        <React.Suspense fallback={null}>
          <PosterModeDialog
            onOpenChange={setOpen}
            onRemix={() => setTemplate((current) => nextPosterTemplate(current))}
            open={open}
            template={template}
          />
        </React.Suspense>
      ) : null}
    </PosterModeContext.Provider>
  );
}

export function usePosterMode(): PosterModeContextValue {
  const context = React.useContext(PosterModeContext);
  if (!context) {
    throw new Error("usePosterMode() must be used inside a PosterModeProvider");
  }
  return context;
}
