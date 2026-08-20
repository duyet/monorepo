import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const appsDir = join(repoRoot, "apps");

const staticApps = [
  "blog",
  "home",
  "cv",
  "kb",
  "insights",
  "photos",
  "homelab",
  "llm-timeline",
  "burns",
  "ai-percentage",
  "x-algo",
];

describe("static app routers keep prerendered loader data", () => {
  it("sets defaultStaleTime to Infinity so hydrate does not refetch", () => {
    for (const app of staticApps) {
      const path = join(appsDir, app, "src/router.tsx");
      expect(existsSync(path), path).toBe(true);
      const source = readFileSync(path, "utf8");
      expect(source, path).toContain(
        "defaultStaleTime: Number.POSITIVE_INFINITY"
      );
    }
  });

  it("shims router.stores.matches so prerender dehydrate does not crash", () => {
    for (const app of staticApps) {
      const path = join(appsDir, app, "src/router.tsx");
      const source = readFileSync(path, "utf8");
      expect(source, path).toContain("shimMatchesStore");
      expect(source, path).toContain("activeMatchesSnapshot");
    }
  });

  it("covers every pages app with a router.tsx", () => {
    const routers = readdirSync(appsDir).filter((app) =>
      existsSync(join(appsDir, app, "src/router.tsx"))
    );
    for (const app of staticApps) {
      expect(routers).toContain(app);
    }
  });
});
