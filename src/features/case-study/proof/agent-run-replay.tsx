"use client";

import * as React from "react";

import type { AgentReplayStep } from "@/content/projects/proof";
import { cn } from "@/lib/utils";

export type AgentRunReplayProps = { steps: readonly AgentReplayStep[] };

const STEP_DELAY_MS = 1800;

function getInitialReducedMotion(): boolean {
  // Unlike the X-Ray canvas, this component isn't lazy-loaded behind a
  // client-only launcher - it renders during SSR too, where `window` (and
  // therefore matchMedia) doesn't exist yet.
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(getInitialReducedMotion);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

function shortLabel(label: string): string {
  return label.replace(/^(Student |Study Plan |Plan )/, "");
}

export function AgentRunReplay({ steps }: AgentRunReplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const active = steps[currentIndex];

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => clearTimer, [clearTimer]);

  // Derived rather than tracked separately: `playing` alone can't tell us
  // whether the timer should still be scheduled, since reaching the last
  // stage should stop advancing without a setState call inside this effect.
  const isAutoAdvancing = playing && currentIndex < steps.length - 1;

  React.useEffect(() => {
    if (!isAutoAdvancing) return;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
    }, STEP_DELAY_MS);
    return clearTimer;
  }, [isAutoAdvancing, currentIndex, steps.length, clearTimer]);

  function selectStage(index: number) {
    clearTimer();
    setPlaying(false);
    setCurrentIndex(index);
  }

  function handlePlay() {
    if (reducedMotion) {
      setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
      return;
    }
    if (currentIndex >= steps.length - 1) setCurrentIndex(0);
    setPlaying(true);
  }

  function handleReset() {
    clearTimer();
    setPlaying(false);
    setCurrentIndex(0);
  }

  if (!active) return null;

  return (
    <div className="mt-8">
      <div aria-label="Select a stage" className="flex flex-wrap gap-2" role="group">
        {steps.map((step, index) => (
          <button
            aria-pressed={index === currentIndex}
            className={cn(
              "border-line inline-flex min-h-11 cursor-pointer items-center border px-3 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-colors",
              index === currentIndex
                ? "bg-ink text-paper"
                : "text-dim hover:bg-ink hover:text-paper",
            )}
            key={step.id}
            onClick={() => selectStage(index)}
            type="button"
          >
            {shortLabel(step.label)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="border-line hover:bg-ink hover:text-paper inline-flex min-h-11 cursor-pointer items-center border px-4 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!reducedMotion && isAutoAdvancing}
          onClick={handlePlay}
          type="button"
        >
          Play
        </button>
        <button
          className="border-line hover:bg-ink hover:text-paper inline-flex min-h-11 cursor-pointer items-center border px-4 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-colors"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div aria-live="polite" className="border-line mt-4 border-t pt-4" role="status">
        <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.1em] uppercase">
          Stage {currentIndex + 1} of {steps.length}: {active.label}
        </p>
        <p className="text-dim mt-2 text-sm leading-relaxed">{active.instruction}</p>
        <dl className="mt-3 flex flex-col gap-2 font-mono text-[0.6875rem] leading-relaxed">
          <div>
            <dt className="text-dim tracking-[0.08em] uppercase">Input</dt>
            <dd className="mt-0.5">{active.input}</dd>
          </div>
          <div>
            <dt className="text-dim tracking-[0.08em] uppercase">Output</dt>
            <dd className="mt-0.5">{active.output}</dd>
          </div>
          <div>
            <dt className="text-dim tracking-[0.08em] uppercase">Decision</dt>
            <dd className="mt-0.5">{active.decision}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
