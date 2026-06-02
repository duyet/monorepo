#!/usr/bin/env tsx

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};

  const env: Record<string, string> = {};
  const content = readFileSync(filePath, "utf-8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadDeployEnv(): Record<string, string> {
  return {
    ...parseEnvFile(join(rootDir, ".env.production")),
    ...parseEnvFile(join(rootDir, ".env.production.local")),
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
  };
}

function readOutputDir(appDir: string, explicitOutputDir?: string): string {
  if (explicitOutputDir) return explicitOutputDir;

  const wranglerPath = join(rootDir, "apps", appDir, "wrangler.toml");
  if (!existsSync(wranglerPath)) return "dist";

  const wrangler = readFileSync(wranglerPath, "utf-8");
  const outputDir = wrangler.match(/pages_build_output_dir\s*=\s*"([^"]+)"/);
  return outputDir?.[1] ?? "dist";
}

function runCommand(cmd: string[], cwd: string, env: Record<string, string>) {
  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function usage(): never {
  console.error(
    "Usage: tsx scripts/cf-deploy-prod.ts <app-dir> <project-name> [output-dir]"
  );
  process.exit(1);
}

const [appDir, projectName, explicitOutputDir] = process.argv.slice(2);
if (!appDir || !projectName) usage();

const appPath = join(rootDir, "apps", appDir);
if (!existsSync(appPath)) {
  console.error(`App directory not found: ${appPath}`);
  process.exit(1);
}

const env = loadDeployEnv();
const outputDir = readOutputDir(appDir, explicitOutputDir);
const productionBranch = env.CF_PAGES_PRODUCTION_BRANCH || "master";
const envLocal = join(rootDir, ".env.local");
const envLocalBackup = join(rootDir, ".env.local.deploy-bak");
let movedEnvLocal = false;

try {
  if (existsSync(envLocal)) {
    if (existsSync(envLocalBackup)) {
      throw new Error(`Refusing to overwrite existing backup: ${envLocalBackup}`);
    }

    renameSync(envLocal, envLocalBackup);
    movedEnvLocal = true;
  }

  runCommand(["pnpm", "run", "build"], appPath, env);
  runCommand(
    [
      "pnpm",
      "dlx",
      "wrangler@4.20.0",
      "pages",
      "deploy",
      outputDir,
      `--project-name=${projectName}`,
      `--branch=${productionBranch}`,
      "--commit-dirty=true",
    ],
    appPath,
    env
  );
} finally {
  if (movedEnvLocal && existsSync(envLocalBackup)) {
    renameSync(envLocalBackup, envLocal);
  }
}
