import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Relative import: cf-deploy-matrix runs via `node --experimental-strip-types`
// in CI without `pnpm install`, so workspace aliases like @duyet/urls are unavailable.
import { PAGES_DOMAIN_OVERRIDES } from "../packages/urls/src/app-registry.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_APPS_DIR = join(__dirname, "..", "apps");

const APPS_WITH_SECRETS = new Set(["blog", "photos", "insights"]);

/** Hostnames that do not follow `<app>.duyet.net`. */
const DOMAIN_OVERRIDES: Record<string, string> = PAGES_DOMAIN_OVERRIDES;

export interface PagesApp {
  name: string;
  projectName: string;
  domain: string;
  url: string;
  outputDir: string;
  secrets: boolean;
}

export function domainForApp(appName: string): string {
  return DOMAIN_OVERRIDES[appName] ?? `${appName}.duyet.net`;
}

function firstTomlString(content: string, key: string): string | undefined {
  const match = content.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"));
  return match?.[1];
}

/**
 * Cloudflare Pages apps: wrangler.toml has `pages_build_output_dir`,
 * and package.json defines `cf:deploy:prod`.
 * Workers (main = …, no pages output dir) are excluded.
 */
export function discoverPagesApps(
  appsDir: string = DEFAULT_APPS_DIR,
): Record<string, PagesApp> {
  const config: Record<string, PagesApp> = {};

  if (!existsSync(appsDir)) {
    return config;
  }

  for (const entry of readdirSync(appsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const appName = entry.name;
    const appDir = join(appsDir, appName);
    const wranglerPath = join(appDir, "wrangler.toml");
    const pkgPath = join(appDir, "package.json");

    if (!existsSync(wranglerPath) || !existsSync(pkgPath)) continue;

    const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      scripts?: Record<string, string>;
    };
    if (!pkgJson.scripts?.["cf:deploy:prod"]) continue;

    const wranglerContent = readFileSync(wranglerPath, "utf-8");
    const outputDir = firstTomlString(wranglerContent, "pages_build_output_dir");
    if (!outputDir) continue;

    const projectName = firstTomlString(wranglerContent, "name");
    if (!projectName) continue;

    const domain = domainForApp(appName);
    config[appName] = {
      name: appName,
      projectName,
      domain,
      url: `https://${domain}`,
      outputDir,
      secrets: APPS_WITH_SECRETS.has(appName),
    };
  }

  return config;
}

export function pagesAppNames(appsDir?: string): string[] {
  return Object.keys(discoverPagesApps(appsDir)).sort();
}

const SHARED_CHANGE_PREFIXES = [
  "packages/",
  "package.json",
  "pnpm-lock.yaml",
  ".npmrc",
];



export function selectAppsToDeploy(opts: {
  apps: Record<string, PagesApp>;
  event: string;
  inputApp?: string;
  changedFiles?: string[];
  scheduledApp?: string;
}): PagesApp[] {
  const names = Object.keys(opts.apps).sort();
  const pick = (list: string[]) =>
    list.filter((name) => opts.apps[name]).map((name) => opts.apps[name]);

  if (opts.event === "schedule") {
    return pick([opts.scheduledApp ?? "burns"]);
  }

  if (opts.event === "workflow_dispatch") {
    const input = opts.inputApp?.trim() ?? "";
    if (input === "all") return pick(names);
    if (input) {
      if (!opts.apps[input]) {
        throw new Error(
          `Unknown Pages app "${input}". Available: ${names.join(", ")}`,
        );
      }
      return pick([input]);
    }
  }

  const files = opts.changedFiles ?? [];
  const sharedChanged = files.some((file) =>
    SHARED_CHANGE_PREFIXES.some((prefix) =>
      prefix.endsWith("/") ? file.startsWith(prefix) : file === prefix,
    ),
  );
  if (sharedChanged) return pick(names);

  const selected = new Set<string>();
  for (const file of files) {
    const match = file.match(/^apps\/([^/]+)\//);
    if (match && opts.apps[match[1]]) {
      selected.add(match[1]);
    }
  }
  return pick([...selected]);
}

export function toDeployMatrix(apps: PagesApp[]): {
  include: Array<{ app: string; project: string; url: string; domain: string }>;
} {
  return {
    include: apps.map((app) => ({
      app: app.name,
      project: app.projectName,
      url: app.url,
      domain: app.domain,
    })),
  };
}
