import { describe, expect, it } from "vitest";
import {
  CHANGE_DETECTION_PATHS,
  selectAppsToBuild,
} from "./deploy-change-detection";

const REQUESTED = ["blog", "kb", "burns", "cv"];

describe("CHANGE_DETECTION_PATHS", () => {
  // The git diff pathspec. Dropping any of these means a class of change
  // deploys nothing (or, worse, deploys a stale build), and the failure is
  // silent -- the deploy still succeeds, just with old content.
  it("watches every path whose change must trigger a rebuild", () => {
    expect(CHANGE_DETECTION_PATHS).toContain("apps/");
    expect(CHANGE_DETECTION_PATHS).toContain("packages/");
    expect(CHANGE_DETECTION_PATHS).toContain("pnpm-lock.yaml");
    expect(CHANGE_DETECTION_PATHS).toContain("package.json");
    expect(CHANGE_DETECTION_PATHS).toContain("turbo.json");
  });
});

describe("selectAppsToBuild", () => {
  it("builds only the apps that changed", () => {
    const { apps } = selectAppsToBuild({
      changedFiles: ["apps/kb/src/routes/index.tsx"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(["kb"]);
  });

  it("deduplicates multiple files in the same app and keeps first-seen order", () => {
    const { apps } = selectAppsToBuild({
      changedFiles: [
        "apps/cv/a.tsx",
        "apps/kb/b.tsx",
        "apps/cv/c.tsx",
        "apps/kb/d.tsx",
      ],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(["cv", "kb"]);
  });

  it("ignores changes to apps that were not requested", () => {
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: ["apps/insights/src/x.ts", "apps/kb/src/y.ts"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(["kb"]);
    expect(logLines[0]).toBe("[INFO] Changed apps detected: kb");
  });

  it("does not match a deeper apps/ path segment as an app name", () => {
    // apps/kb/kb is the kb content submodule, not a sibling app.
    const { apps } = selectAppsToBuild({
      changedFiles: ["apps/kb/kb/raw/notes/a.md"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(["kb"]);
  });

  it("builds every requested app when a shared package changes", () => {
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: ["packages/components/src/A.tsx", "packages/urls/src/B.ts"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(REQUESTED);
    expect(logLines).toEqual([
      "[INFO] Building all apps: shared packages changed (2 files)",
    ]);
  });

  it.each(["turbo.json", "package.json", "pnpm-lock.yaml"])(
    "builds every requested app when %s changes",
    (file) => {
      const { apps, logLines } = selectAppsToBuild({
        changedFiles: [file],
        requestedApps: REQUESTED,
      });
      expect(apps).toEqual(REQUESTED);
      expect(logLines).toEqual([
        "[INFO] Building all apps: core config changed",
      ]);
    }
  );

  it("reports both reasons when packages and core config change together", () => {
    const { logLines } = selectAppsToBuild({
      changedFiles: ["packages/urls/src/B.ts", "pnpm-lock.yaml"],
      requestedApps: REQUESTED,
    });
    expect(logLines).toEqual([
      "[INFO] Building all apps: shared packages changed (1 files), core config changed",
    ]);
  });

  it("does not full-rebuild for a deploy-only config change", () => {
    // The orchestrator is a deployment input, not a build input: it must not
    // cause a rebuild of every app, but it is still worth logging.
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: ["scripts/cf-deploy.ts"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(REQUESTED); // via the no-changes safety fallback
    expect(logLines).toEqual([
      "[INFO] No app changes detected",
      "[INFO] Config changes (deployment only): scripts/cf-deploy.ts",
      "[INFO] No app changes detected. Building all apps for safety.",
    ]);
  });

  it("logs a deploy-only config change alongside a real app change", () => {
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: ["apps/kb/src/y.ts", "scripts/cf-deploy.ts"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(["kb"]);
    expect(logLines).toEqual([
      "[INFO] Changed apps detected: kb",
      "[INFO] Config changes (deployment only): scripts/cf-deploy.ts",
    ]);
  });

  it("builds all requested apps when the diff touches nothing relevant", () => {
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: ["README.md", "docs/ai/core-memory.md"],
      requestedApps: REQUESTED,
    });
    expect(apps).toEqual(REQUESTED);
    expect(logLines).toEqual([
      "[INFO] No app changes detected",
      "[INFO] No app changes detected. Building all apps for safety.",
    ]);
  });

  it("builds an explicitly requested app even with an empty diff", () => {
    const { apps, logLines } = selectAppsToBuild({
      changedFiles: [],
      requestedApps: ["kb"],
      targetApp: "kb",
    });
    expect(apps).toEqual(["kb"]);
    expect(logLines).toEqual([
      "[INFO] No app changes detected",
      "[INFO] No changes detected, but building requested app: kb",
    ]);
  });

  it("still returns exactly the requested set, never all discovered apps", () => {
    // The caller passes the already-validated request list; returning anything
    // wider here would deploy an app the operator did not ask for.
    const { apps } = selectAppsToBuild({
      changedFiles: ["packages/urls/src/B.ts"],
      requestedApps: ["kb"],
    });
    expect(apps).toEqual(["kb"]);
  });
});
