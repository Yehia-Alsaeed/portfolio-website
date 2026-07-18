import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type LighthouseCategory = { score: number };
type LighthouseAudit = { numericValue: number };

export type LighthouseRun = {
  categories: Record<string, LighthouseCategory>;
  audits: Record<string, LighthouseAudit>;
};

type LighthouseSummary = {
  runs: number;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    largestContentfulPaintMs: number;
    cumulativeLayoutShift: number;
  };
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const value = sorted[Math.floor(sorted.length / 2)];
  if (value === undefined) throw new Error("Cannot calculate a median without values");
  return value;
}

export function summarizeLighthouseRuns(runs: LighthouseRun[]): LighthouseSummary {
  if (runs.length === 0) throw new Error("At least one Lighthouse run is required");

  const category = (name: string): number =>
    median(
      runs.map((run) => {
        const value = run.categories[name];
        if (!value) throw new Error(`Missing Lighthouse category: ${name}`);
        return value.score * 100;
      }),
    );
  const audit = (name: string): number =>
    median(
      runs.map((run) => {
        const value = run.audits[name];
        if (!value) throw new Error(`Missing Lighthouse audit: ${name}`);
        return value.numericValue;
      }),
    );

  return {
    runs: runs.length,
    scores: {
      performance: category("performance"),
      accessibility: category("accessibility"),
      bestPractices: category("best-practices"),
      seo: category("seo"),
    },
    metrics: {
      largestContentfulPaintMs: audit("largest-contentful-paint"),
      cumulativeLayoutShift: audit("cumulative-layout-shift"),
    },
  };
}

async function main() {
  const reportDirectory = resolve(".lighthouseci");
  const files = (await readdir(reportDirectory))
    .filter((file) => file.startsWith("lhr-") && file.endsWith(".json"))
    .sort();
  const runs = await Promise.all(
    files.map(
      async (file) =>
        JSON.parse(await readFile(resolve(reportDirectory, file), "utf8")) as LighthouseRun,
    ),
  );

  if (runs.length !== 3) throw new Error(`Expected 3 Lighthouse runs, received ${runs.length}`);

  const output = resolve("docs/implementation/phase-3-lighthouse-baseline.json");
  const result = summarizeLighthouseRuns(runs);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
