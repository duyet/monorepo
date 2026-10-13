#!/usr/bin/env tsx

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnvFile } from "./parse-env.ts";
import { readPagesOutputDir } from "./wrangler-toml.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");

function loadDeployEnv(): Record<string, string> {
  return {
    ...parseEnvFile(join(rootDir, ".env.local")),
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
  };
}

function readOutputDir(appDir: string, explicitOutputDir?: string): string {
  if (explicitOutputDir) return explicitOutputDir;
  return readPagesOutputDir(join(rootDir, "apps", appDir)) ?? "dist";
}

/** Carries a child process's exit code out so the top level can mirror it. */
class CommandFailed extends Error {
  constructor(readonly code: number) {
    super(`Command exited with code ${code}`);
  }
}

function runCommand(cmd: string[], cwd: string, env: Record<string, string>) {
  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new CommandFailed(result.status ?? 1);
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
const productionBranch = env.CF_PAGES_PRODUCTION_BRANCH || "main";
let exitCode = 0;

try {
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
} catch (err) {
  exitCode = err instanceof CommandFailed ? err.code : 1;
  console.error(err instanceof CommandFailed ? `✗ ${err.message}` : err);
}

process.exit(exitCode);
