import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return collectSourceFiles(path);
    return SOURCE_EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

// The site intentionally renders zero third-party iframes (decision
// register HOST-001/UI locks) - client-work "live" demos use device-frame
// chrome and real links instead. This scans the whole tree rather than one
// component so any future file introducing an iframe fails a test, not
// just a manual audit.
describe("no-iframes policy", () => {
  it("never uses <iframe> anywhere in src/", () => {
    const offenders = collectSourceFiles(join(process.cwd(), "src")).filter((file) =>
      /<iframe/i.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });
});
