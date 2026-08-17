#!/usr/bin/env tsx

/**
 * Print a GitHub Actions matrix of Cloudflare Pages apps to deploy.
 *
 * Usage:
 *   pnpm exec tsx scripts/cf-deploy-matrix.ts \
 *     --event push|pull_request|schedule|workflow_dispatch \
 *     [--input-app NAME|all] \
 *     [--base SHA] [--head SHA]
 */

import { spawnSync } from "node:child_process";
import {
  discoverPagesApps,
  selectAppsToDeploy,
  toDeployMatrix,
} from "./cf-pages-apps.ts";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function isGitRef(value?: string): value is string {
  return Boolean(value && !/^0+$/.test(value));
}

function gitChangedFiles(base?: string, head?: string): string[] {
  const range = isGitRef(base)
    ? `${base}...${isGitRef(head) ? head : "HEAD"}`
    : "HEAD~1...HEAD";
  const result = spawnSync("git", ["diff", "--name-only", range], {
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    console.error(result.stderr || `git diff failed for ${range}`);
    return [];
  }
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const event = argValue("--event") ?? process.env.GITHUB_EVENT_NAME ?? "push";
const inputApp = argValue("--input-app") ?? "";
const base = argValue("--base");
const head = argValue("--head");

const apps = discoverPagesApps();
const names = Object.keys(apps).sort();
if (names.length === 0) {
  console.error("No Cloudflare Pages apps discovered");
  process.exit(1);
}

console.error(`Discovered Pages apps: ${names.join(", ")}`);

let changedFiles: string[] | undefined;
if (event === "push" || event === "pull_request" || inputApp === "") {
  try {
    changedFiles = gitChangedFiles(base, head);
  } catch {
    changedFiles = [];
  }
}

const selected = selectAppsToDeploy({
  apps,
  event,
  inputApp,
  changedFiles,
});

const matrix = toDeployMatrix(selected);
if (selected.length === 0) {
  console.error("No apps to deploy");
} else {
  console.error(`Apps to deploy: ${selected.map((app) => app.name).join(", ")}`);
}

const encoded = JSON.stringify(matrix);
process.stdout.write(`${encoded}\n`);
if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${encoded}\n`);
}
