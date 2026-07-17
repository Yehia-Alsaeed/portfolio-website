import { gzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type FileMeasurement = {
  file: string;
  gzipBytes: number;
  rawBytes: number;
};

export type BuildMeasurement = {
  fileCount: number;
  gzipBytes: number;
  scope: string;
  totalBytes: number;
  files: FileMeasurement[];
};

async function listJavaScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listJavaScriptFiles(path)));
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(path);
  }

  return files.sort();
}

export async function measureJavaScript(chunksDirectory: string): Promise<BuildMeasurement> {
  const files = await listJavaScriptFiles(chunksDirectory);
  const measurements = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file);
      return {
        file: relative(chunksDirectory, file).replaceAll("\\", "/"),
        gzipBytes: gzipSync(content).byteLength,
        rawBytes: content.byteLength,
      };
    }),
  );

  return {
    fileCount: measurements.length,
    gzipBytes: measurements.reduce((sum, value) => sum + value.gzipBytes, 0),
    scope: ".next/static/chunks/**/*.js",
    totalBytes: measurements.reduce((sum, value) => sum + value.rawBytes, 0),
    files: measurements,
  };
}

async function main() {
  const output = resolve("docs/implementation/phase-1-build-baseline.json");
  const result = await measureJavaScript(resolve(".next/static/chunks"));
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
