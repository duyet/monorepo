import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_APPS_DIR,
  discoverPagesApps,
  domainForApp,
  selectAppsToDeploy,
  toDeployMatrix,
} from "./cf-pages-apps.ts";

describe("domainForApp", () => {
  it("uses hostname overrides and the default <app>.duyet.net pattern", () => {
    expect(domainForApp("home")).toBe("duyet.net");
    expect(domainForApp("agent-ui")).toBe("agents.duyet.net");
    expect(domainForApp("burns")).toBe("duyet-burns.pages.dev");
    expect(domainForApp("kb")).toBe("kb.duyet.net");
  });
});

describe("discoverPagesApps", () => {
  it("includes kb and other Pages apps, excludes Workers", () => {
    const apps = discoverPagesApps(DEFAULT_APPS_DIR);
    expect(apps.kb?.projectName).toBe("duyet-kb");
    expect(apps.kb?.url).toBe("https://kb.duyet.net");
    expect(apps.blog).toBeDefined();
    expect(apps.burns).toBeDefined();
    expect(apps["agent-api"]).toBeUndefined();
    expect(apps.news).toBeUndefined();
    expect(apps.api).toBeUndefined();
    expect(apps["paid-api"]).toBeUndefined();
    expect(apps["agent-assistant"]).toBeUndefined();
  });

  it("requires pages_build_output_dir and cf:deploy:prod", () => {
    const root = mkdtempSync(join(tmpdir(), "cf-pages-apps-"));
    mkdirSync(join(root, "pages-app"));
    writeFileSync(
      join(root, "pages-app", "package.json"),
      JSON.stringify({ scripts: { "cf:deploy:prod": "echo" } }),
    );
    writeFileSync(
      join(root, "pages-app", "wrangler.toml"),
      'name = "duyet-pages-app"\npages_build_output_dir = "dist/client"\n',
    );
    mkdirSync(join(root, "worker"));
    writeFileSync(
      join(root, "worker", "package.json"),
      JSON.stringify({ scripts: { "cf:deploy:prod": "wrangler deploy" } }),
    );
    writeFileSync(
      join(root, "worker", "wrangler.toml"),
      'name = "duyet-worker"\nmain = "src/index.ts"\n',
    );

    const apps = discoverPagesApps(root);
    expect(Object.keys(apps)).toEqual(["pages-app"]);
    expect(apps["pages-app"].projectName).toBe("duyet-pages-app");
  });
});

describe("selectAppsToDeploy", () => {
  const apps = discoverPagesApps(DEFAULT_APPS_DIR);

  it("deploys only burns on schedule", () => {
    expect(
      selectAppsToDeploy({ apps, event: "schedule" }).map((app) => app.name),
    ).toEqual(["burns"]);
  });

  it("deploys a named app or all apps on workflow_dispatch", () => {
    expect(
      selectAppsToDeploy({
        apps,
        event: "workflow_dispatch",
        inputApp: "kb",
      }).map((app) => app.name),
    ).toEqual(["kb"]);
    expect(
      selectAppsToDeploy({
        apps,
        event: "workflow_dispatch",
        inputApp: "all",
      }).map((app) => app.name),
    ).toEqual(Object.keys(apps).sort());
  });

  it("deploys only the changed Pages app on push", () => {
    expect(
      selectAppsToDeploy({
        apps,
        event: "push",
        changedFiles: [
          "apps/kb/src/routes/index.tsx",
          "apps/news/src/index.ts",
        ],
      }).map((app) => app.name),
    ).toEqual(["kb"]);
  });

  it("deploys every Pages app when deploy discovery files change", () => {
    expect(
      selectAppsToDeploy({
        apps,
        event: "push",
        changedFiles: ["scripts/cf-pages-apps.ts"],
      }).map((app) => app.name),
    ).toEqual(Object.keys(apps).sort());
    expect(
      selectAppsToDeploy({
        apps,
        event: "push",
        changedFiles: ["scripts/cf-pages-apps.ts"],
      }).some((app) => app.name === "kb"),
    ).toBe(true);
  });

  it("deploys every Pages app when shared packages change", () => {
    expect(
      selectAppsToDeploy({
        apps,
        event: "push",
        changedFiles: ["packages/components/site-header/SiteHeader.tsx"],
      }).map((app) => app.name),
    ).toEqual(Object.keys(apps).sort());
  });

  it("encodes a GitHub Actions matrix", () => {
    const matrix = toDeployMatrix(
      selectAppsToDeploy({
        apps,
        event: "workflow_dispatch",
        inputApp: "kb",
      }),
    );
    expect(matrix).toEqual({
      include: [
        {
          app: "kb",
          project: "duyet-kb",
          url: "https://kb.duyet.net",
          domain: "kb.duyet.net",
        },
      ],
    });
  });
});
