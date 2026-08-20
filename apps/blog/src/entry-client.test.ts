import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const appsDir = join(repoRoot, "apps");

function listClientEntries(): string[] {
  return readdirSync(appsDir)
    .map((app) => join(appsDir, app, "src/client.tsx"))
    .filter((path) => existsSync(path));
}

describe("static app hydrate guard", () => {
  it("sets __CF_ENTRY_RAN__ in src/client.tsx so CF retry cannot remount", () => {
    const entries = listClientEntries();
    expect(entries.length).toBeGreaterThan(8);
    for (const path of entries) {
      const source = readFileSync(path, "utf8");
      expect(source, path).toContain("__CF_ENTRY_RAN__");
      expect(source, path).toContain("hydrateRoot(");
    }
  });
});
