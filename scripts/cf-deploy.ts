#!/usr/bin/env bun

/**
 * Comprehensive Cloudflare Pages Deployment Orchestrator
 *
 * Usage: bun cf-deploy.ts [app-name] [--prod] [--dry-run]
 *
 * Options:
 *   --prod     Deploy to production (main branch, custom domains)
 *   --dry-run  Show what would be deployed without making changes
 *
 * Deploys all apps (or specific app) to Cloudflare Pages with proper orchestration:
 * 1. Build phase: Build all apps in parallel
 * 2. Config phase: Sync secrets and environment variables
 * 3. Deploy phase: Deploy each app to its Cloudflare Pages project
 *
 * Deployment modes:
 * - Without --prod: Preview deployment (aliased URL like <hash>.<project>.pages.dev)
 * - With --prod: Production deployment (custom domains like blog.duyet.net)
 *
 * Apps and their deployment targets:
 * - home → duyet.net (duyet-home project)
 * - cv → cv.duyet.net (duyet-cv project)
 * - blog → blog.duyet.net (duyet-blog project)
 * - photos → photos.duyet.net (duyet-photos project)
 * - insights → insights.duyet.net (duyet-insights project)
 * - homelab → homelab.duyet.net (duyet-homelab project)
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

/**
 * Parse a .env file and return key-value pairs
 * Handles comments, empty lines, and quoted values
 */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    console.error(`[ERROR] Environment file not found: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const env: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove surrounding quotes if present
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

// Load production environment from .env.production
// These values override .env.local during build (process.env has highest precedence)
const envProductionPath = join(rootDir, ".env.production");
const PRODUCTION_ENV = parseEnvFile(envProductionPath);

// Configuration for apps that deploy to Cloudflare Pages
const APPS_CONFIG: Record<
  string,
  {
    name: string;
    projectName: string;
    domain: string;
    secrets: boolean;
  }
> = {
  home: {
    name: "home",
    projectName: "duyet-home",
    domain: "duyet.net",
    secrets: false,
  },
  cv: {
    name: "cv",
    projectName: "duyet-cv",
    domain: "cv.duyet.net",
    secrets: false,
  },
  blog: {
    name: "blog",
    projectName: "duyet-blog",
    domain: "blog.duyet.net",
    secrets: true,
  },
  photos: {
    name: "photos",
    projectName: "duyet-photos",
    domain: "photos.duyet.net",
    secrets: true,
  },
  insights: {
    name: "insights",
    projectName: "duyet-insights",
    domain: "insights.duyet.net",
    secrets: true,
  },
  homelab: {
    name: "homelab",
    projectName: "duyet-homelab",
    domain: "homelab.duyet.net",
    secrets: false,
  },
};

// CLI args
const dryRun = process.argv.includes("--dry-run");
const isProd = process.argv.includes("--prod");
// Filter out node/bun executable and script path, keep only actual arguments
const args = process.argv.slice(2);
const targetApp = args.find((arg) => !arg.startsWith("--"));

// Track which apps were actually built and should be deployed
let appsToDeploy: string[] = [];

if (dryRun) {
  console.log("[INFO] Dry run mode - no changes will be made\n");
}

if (isProd) {
  console.log("[INFO] Production deployment mode enabled\n");
}

// Validate arguments
const appsToDeployList = targetApp ? [targetApp] : Object.keys(APPS_CONFIG);

// Verify all requested apps exist
const invalidApps = appsToDeployList.filter((app) => !APPS_CONFIG[app]);
if (invalidApps.length > 0) {
  console.error(`[ERROR] Unknown app(s): ${invalidApps.join(", ")}`);
  console.error(`Available apps: ${Object.keys(APPS_CONFIG).join(", ")}`);
  process.exit(1);
}

// Verify apps exist in filesystem
for (const app of appsToDeployList) {
  const appDir = join(rootDir, "apps", app);
  if (!existsSync(appDir)) {
    console.error(`[ERROR] App directory not found: ${appDir}`);
    process.exit(1);
  }

  const wranglerToml = join(appDir, "wrangler.toml");
  if (!existsSync(wranglerToml)) {
    console.error(`[ERROR] wrangler.toml not found in ${appDir}`);
    process.exit(1);
  }
}

/**
 * Run a command and return the result
 */
async function runCommand(
  cmd: string[],
  cwd: string,
  description: string,
  ignoreError = false,
  env?: Record<string, string>
): Promise<{
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const processResult = Bun.spawnSync({
      cmd,
      cwd,
      stdio: ["inherit", "pipe", "pipe"],
      env: env ? { ...Bun.env, ...env } : undefined,
    });

    const stdout = processResult.stdout.toString();
    const stderr = processResult.stderr.toString();
    const success = processResult.exitCode === 0;

    if (!success && !ignoreError) {
      console.error(`  [ERROR] ${description} failed`);
      if (stderr) console.error(`    ${stderr}`);
    }

    resolve({
      success,
      code: processResult.exitCode || 1,
      stdout,
      stderr,
    });
  });
}

/**
 * Get changed apps compared to a base branch using git
 *
 * This function determines which apps need to be rebuilt by analyzing:
 * 1. Direct changes to app directories
 * 2. Changes to shared packages (affects all apps)
 * 3. Changes to shared config files (affects all apps)
 *
 * @param baseBranch - The git branch to compare against (default: origin/master)
 * @returns Array of app names that need to be built
 */
function getChangedApps(baseBranch = "origin/master"): string[] {
  if (dryRun) {
    console.log(`[DRY RUN] Would check for changed apps against ${baseBranch}`);
    return appsToDeployList;
  }

  // Get all changed files including deletions and renames
  const gitResult = Bun.spawnSync({
    cmd: [
      "git",
      "diff",
      "--name-only",
      "--diff-filter=d", // Exclude deleted files from triggering rebuilds
      `${baseBranch}...HEAD`,
      "--",
      "apps/",
      "packages/",
      "turbo.json",
      "package.json",
      "bun.lockb",
      ".env.production",
      "scripts/",
    ],
    cwd: rootDir,
  });

  if (gitResult.exitCode !== 0) {
    console.warn(
      `[WARN] Could not determine changed apps (git diff failed), building all requested apps`
    );
    return appsToDeployList;
  }

  const changedFiles = gitResult.stdout
    .toString()
    .split("\n")
    .filter(Boolean);

  // Extract app names from changed files
  const changedAppsSet = new Set<string>();

  for (const file of changedFiles) {
    if (file.startsWith("apps/")) {
      const parts = file.split("/");
      const appName = parts[1]; // apps/{appName}/...
      if (appsToDeployList.includes(appName)) {
        changedAppsSet.add(appName);
      }
    }
  }

  // Check for changes in shared packages that affect all apps
  const sharedPackageChanges = changedFiles.filter((file) =>
    file.startsWith("packages/")
  );

  // Check for changes in critical config files
  const configChanges = changedFiles.filter((file) =>
    [
      "turbo.json",
      "package.json",
      "bun.lockb",
      ".env.production",
      "scripts/cf-deploy.ts",
    ].includes(file)
  );

  // Determine if we need to build all apps
  const buildAllApps =
    sharedPackageChanges.length > 0 ||
    configChanges.some((file) => file === "turbo.json" || file === "package.json" || file === "bun.lockb");

  if (buildAllApps) {
    const reasons = [];
    if (sharedPackageChanges.length > 0) {
      reasons.push(`shared packages changed (${sharedPackageChanges.length} files)`);
    }
    if (configChanges.some(f => ["turbo.json", "package.json", "bun.lockb"].includes(f))) {
      reasons.push("core config changed");
    }
    console.log(
      `[INFO] Building all apps: ${reasons.join(", ")}`
    );
    return appsToDeployList;
  }

  const result = Array.from(changedAppsSet);

  // Log what we found
  if (result.length > 0) {
    console.log(`[INFO] Changed apps detected: ${result.join(", ")}`);
  } else {
    console.log(`[INFO] No app changes detected`);
  }

  // Log config changes that don't require full rebuild
  if (configChanges.length > 0) {
    console.log(`[INFO] Config changes (deployment only): ${configChanges.join(", ")}`);
  }

  // If no specific app changes detected but we have a target, build it
  if (result.length === 0 && targetApp) {
    console.log(`[INFO] No changes detected, but building requested app: ${targetApp}`);
    return [targetApp];
  }

  // If deploying all and no changes, build all for safety
  if (result.length === 0 && !targetApp) {
    console.log("[INFO] No app changes detected. Building all apps for safety.");
    return appsToDeployList;
  }

  return result;
}

/**
 * Build apps for Cloudflare Pages deployment using turbo
 */
async function buildAllApps(): Promise<boolean> {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║         🔨 PHASE 1: Building Apps             ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  if (dryRun) {
    console.log(
      `[DRY RUN] Would build ${appsToDeployList.length} app(s): ${appsToDeployList.join(", ")}`
    );
    return true;
  }

  // Determine which apps actually need to be built
  const appsToBuild = getChangedApps();

  if (appsToBuild.length === 0) {
    console.log("[INFO] No apps need to be built. Skipping build phase.\n");
    return true;
  }

  console.log(
    `[INFO] Building ${appsToBuild.length} app(s) for deployment: ${appsToBuild.join(", ")}`
  );
  console.log(`[INFO] Loading environment from: .env.production`);
  console.log(`[INFO] Production URLs:`);
  console.log(
    `       NEXT_PUBLIC_DUYET_HOME_URL=${PRODUCTION_ENV.NEXT_PUBLIC_DUYET_HOME_URL || "(not set)"}`
  );
  console.log(
    `       NEXT_PUBLIC_DUYET_BLOG_URL=${PRODUCTION_ENV.NEXT_PUBLIC_DUYET_BLOG_URL || "(not set)"}`
  );
  console.log(`       NODE_ENV=${PRODUCTION_ENV.NODE_ENV || "(not set)"}`);

  // Build each app individually to handle failures gracefully
  // Pass PRODUCTION_ENV which sets process.env values directly
  // process.env has highest precedence and overrides .env.local localhost URLs
  const buildResults = await Promise.all(
    appsToBuild.map((app) =>
      runCommand(
        ["bun", "run", "build"],
        join(rootDir, "apps", app),
        `Build ${app}`,
        true, // Allow failure to continue
        PRODUCTION_ENV
      )
    )
  );

  const failed = appsToBuild.filter((_, i) => !buildResults[i].success);
  const succeeded = appsToBuild.filter((_, i) => buildResults[i].success);

  if (failed.length > 0) {
    console.error(
      `[ERROR] ${failed.length} app(s) failed to build: ${failed.join(", ")}`
    );
    return false;
  }

  console.log(`[✓] All ${appsToBuild.length} app(s) built successfully\n`);

  // Store successfully built apps for deployment phase
  appsToDeploy = succeeded;

  return true;
}

/**
 * Sync secrets and environment variables for an app
 */
async function syncAppSecrets(appName: string): Promise<boolean> {
  const appConfig = APPS_CONFIG[appName];
  if (!appConfig.secrets) {
    return true; // No secrets to sync
  }

  if (dryRun) {
    console.log(`    [DRY RUN] Would sync secrets for ${appName}`);
    return true;
  }

  const result = await runCommand(
    ["bun", "../../scripts/sync-app-secrets.ts", appConfig.projectName],
    join(rootDir, "apps", appName),
    `Sync secrets for ${appName}`,
    true // Don't fail on error here, we'll handle it gracefully
  );

  return result.success;
}

/**
 * Config phase: Sync secrets for all apps
 */
async function configPhase(): Promise<boolean> {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║    🔐 PHASE 2: Syncing Secrets & Env Vars    ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  const appsWithSecrets = appsToDeployList.filter(
    (app) => APPS_CONFIG[app].secrets
  );

  if (appsWithSecrets.length === 0) {
    console.log("[INFO] No apps require secret syncing\n");
    return true;
  }

  console.log(
    `[INFO] Syncing secrets for ${appsWithSecrets.length} app(s)...\n`
  );

  const results = await Promise.all(
    appsWithSecrets.map((app) => syncAppSecrets(app))
  );

  const failed = appsWithSecrets.filter((_, i) => !results[i]);

  if (failed.length > 0) {
    console.warn(`[WARN] Failed to sync secrets for: ${failed.join(", ")}`);
    console.warn(
      "[WARN] Deployment will continue, but secrets may not be available\n"
    );
  } else {
    console.log("[✓] Secrets synced successfully\n");
  }

  return true;
}

/**
 * Deploy a single app to Cloudflare Pages
 */
async function deployApp(appName: string): Promise<{
  success: boolean;
  app: string;
}> {
  const appConfig = APPS_CONFIG[appName];
  const appDir = join(rootDir, "apps", appName);
  const deployTarget = isProd ? "production" : "preview";

  console.log(`  📦 ${appName}`);
  console.log(`     → Project: ${appConfig.projectName}`);
  console.log(`     → Target: ${deployTarget}`);
  if (isProd) {
    console.log(`     → Domain: https://${appConfig.domain}`);
  }

  // Build wrangler command
  const wranglerCmd = [
    "bunx",
    "wrangler",
    "pages",
    "deploy",
    "out",
    `--project-name=${appConfig.projectName}`,
  ];

  // For preview deployments, use current git branch
  // Production deployments (isProd) don't specify --branch, which deploys to production
  if (!isProd) {
    // Get current git branch for preview deployment alias
    const gitBranch = Bun.spawnSync({
      cmd: ["git", "branch", "--show-current"],
      cwd: rootDir,
    });
    const branch = gitBranch.stdout.toString().trim();
    if (branch && branch !== "main" && branch !== "master") {
      wranglerCmd.push(`--branch=${branch}`);
    }
  }

  // Allow deploying uncommitted changes
  wranglerCmd.push("--commit-dirty=true");

  if (dryRun) {
    console.log(`     [DRY RUN] Would run: ${wranglerCmd.join(" ")}`);
    return { success: true, app: appName };
  }

  const result = await runCommand(
    wranglerCmd,
    appDir,
    `Deploy ${appName}`,
    true
  );

  if (result.success) {
    console.log(`     ✓ Deployed successfully to ${deployTarget}`);
  } else {
    console.log(`     ✗ Deployment failed`);
  }

  return {
    success: result.success,
    app: appName,
  };
}

/**
 * Deploy phase: Deploy all apps to Cloudflare Pages
 */
async function deployPhase(): Promise<boolean> {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     🚀 PHASE 3: Deploying to Cloudflare       ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Only deploy apps that were successfully built
  const appsToDeployNow = appsToDeploy.length > 0 ? appsToDeploy : appsToDeployList;

  console.log(`[INFO] Deploying ${appsToDeployNow.length} app(s)...\n`);

  const results = await Promise.all(
    appsToDeployNow.map((app) => deployApp(app))
  );

  const failed = results.filter((r) => !r.success);
  const succeeded = results.filter((r) => r.success);

  console.log("\n");

  if (failed.length > 0) {
    console.error(
      `[ERROR] ${failed.length} deployment(s) failed: ${failed.map((r) => r.app).join(", ")}`
    );
    return false;
  }

  console.log(`[✓] All ${succeeded.length} app(s) deployed successfully`);
  return true;
}

/**
 * Print final summary
 */
function printSummary(success: boolean) {
  const deployMode = isProd ? "PRODUCTION" : "PREVIEW";

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║              📊 DEPLOYMENT SUMMARY            ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  if (dryRun) {
    console.log("[DRY RUN MODE] No actual changes were made\n");
    return;
  }

  console.log(`[MODE] ${deployMode}\n`);
  console.log("[APPS DEPLOYED]");

  // Show which apps were actually deployed
  const actuallyDeployed = appsToDeploy.length > 0 ? appsToDeploy : appsToDeployList;

  for (const app of actuallyDeployed) {
    const config = APPS_CONFIG[app];
    const status = success ? "✓" : "?";
    if (isProd) {
      console.log(`  ${status} ${app} → https://${config.domain}`);
    } else {
      console.log(
        `  ${status} ${app} → https://${config.projectName}.pages.dev (preview)`
      );
    }
  }

  // Show apps that were skipped if any
  if (appsToDeploy.length > 0 && appsToDeploy.length < appsToDeployList.length) {
    const skippedApps = appsToDeployList.filter(app => !appsToDeploy.includes(app));
    if (skippedApps.length > 0) {
      console.log("\n[APPS SKIPPED - No Changes]");
      for (const app of skippedApps) {
        console.log(`  ⊝ ${app} - No changes detected`);
      }
    }
  }

  console.log("\n[NEXT STEPS]");
  if (success) {
    console.log("  ✓ All deployments completed successfully");
    if (isProd) {
      console.log("  ✓ Check your deployed apps at the custom domains above");
    } else {
      console.log(
        "  ✓ Preview deployments are available at the pages.dev URLs"
      );
      console.log("  ✓ Use --prod flag to deploy to production");
    }
    console.log(
      "  ✓ Verify functionality and monitor Cloudflare Pages dashboard"
    );
  } else {
    console.log("  ✗ Some deployments failed");
    console.log("  ✗ Check the logs above for error details");
    console.log("  ✗ Ensure Cloudflare API credentials are configured");
  }

  console.log("");
}

/**
 * Main execution
 */
async function main() {
  console.log("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
  console.log("┃     Cloudflare Pages Deployment Orchestrator   ┃");
  console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");

  const deployMode = isProd ? "PRODUCTION" : "PREVIEW";
  console.log("\n[DEPLOYMENT PLAN]");
  console.log(`  Apps: ${appsToDeployList.join(", ")}`);
  console.log(`  Mode: ${deployMode}`);
  console.log(`  Phase 1: Build all apps`);
  console.log(`  Phase 2: Sync secrets/env vars`);
  console.log(`  Phase 3: Deploy to Cloudflare Pages`);

  if (dryRun) {
    console.log("\n  ⚠️  DRY RUN (no actual changes will be made)");
  }
  if (!isProd) {
    console.log("\n  💡 Tip: Use --prod to deploy to production");
  }

  // Build
  const buildSuccess = await buildAllApps();
  if (!buildSuccess) {
    process.exit(1);
  }

  // Config
  const configSuccess = await configPhase();
  if (!configSuccess) {
    console.warn(
      "[WARN] Config phase had issues, continuing with deployment..."
    );
  }

  // Deploy
  const deploySuccess = await deployPhase();

  // Summary
  printSummary(deploySuccess);

  process.exit(deploySuccess ? 0 : 1);
}

main().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
