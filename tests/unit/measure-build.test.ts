// @vitest-environment node

import { gzipSync } from "node:zlib";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { measureJavaScript } from "../../scripts/measure-build";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("measureJavaScript", () => {
  it("counts only JavaScript files and reports raw and gzip totals", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-build-metrics-"));
    temporaryDirectories.push(root);
    const nested = join(root, "nested");
    await mkdir(nested);

    const first = Buffer.from("console.log('first');");
    const second = Buffer.from("console.log('second');");
    await writeFile(join(root, "first.js"), first);
    await writeFile(join(nested, "second.js"), second);
    await writeFile(join(root, "styles.css"), "body {}");

    const result = await measureJavaScript(root);

    expect(result.fileCount).toBe(2);
    expect(result.totalBytes).toBe(first.byteLength + second.byteLength);
    expect(result.gzipBytes).toBe(gzipSync(first).byteLength + gzipSync(second).byteLength);
    expect(result.files.map(({ file }) => file)).toEqual(["first.js", "nested/second.js"]);
  });
});
