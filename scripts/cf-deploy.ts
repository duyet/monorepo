#!/usr/bin/env bun
/**
 * Comprehensive Cloudflare Pages Deployment Orchestrator
 *
 * Usage: bun cf-deploy.ts [app-name] [--dry-run]
 *
 * Deploys all apps (or specific app) to Cloudflare Pages with proper orchestration:
 * 1. Build phase: Build all apps in parallel
 * 2. Config phase: Sync secrets and environment variables
 * 3. Deploy phase: Deploy each app to its Cloudflare Pages project
 *
 * Apps and their deployment targets:
 * - home → duyet.net (duyet-home project)
 * - cv → cv.duyet.net (duyet-cv project)
 * - blog → blog.duyet.net (duyet-blog project)
 * - photos → photos.duyet.net (duyet-photos project)
 * - insights → insights.duyet.net (duyet-insights project)
 * - homelab → homelab.duyet.net (duyet-homelab project)
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

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
// Filter out node/bun executable and script path, keep only actual arguments
const args = process.argv.slice(2);
const targetApp = args.find((arg) => !arg.startsWith("--"));

if (dryRun) {
  console.log("[INFO] Dry run mode - no changes will be made\n");
}

// Validate arguments
const appsToDeployList = targetApp
  ? [targetApp]
  : Object.keys(APPS_CONFIG);

// Verify all requested apps exist
const invalidApps = appsToDeployList.filter(
  (app) => !APPS_CONFIG[app]
);
if (invalidApps.length > 0) {
  console.error(
    `[ERROR] Unknown app(s): ${invalidApps.join(", ")}`
  );
  console.error(
    `Available apps: ${Object.keys(APPS_CONFIG).join(", ")}`
  );
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
    console.error(
      `[ERROR] wrangler.toml not found in ${appDir}`
    );
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
  ignoreError = false
): Promise<{
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const process = Bun.spawnSync({
      cmd,
      cwd,
      stdio: ["inherit", "pipe", "pipe"],
    });

    const stdout = process.stdout.toString();
    const stderr = process.stderr.toString();
    const success = process.exitCode === 0;

    if (!success && !ignoreError) {
      console.error(`  [ERROR] ${description} failed`);
      if (stderr) console.error(`    ${stderr}`);
    }

    resolve({
      success,
      code: process.exitCode || 1,
      stdout,
      stderr,
    });
  });
}

/**
 * Build all apps in parallel using turbo
 */
async function buildAllApps(): Promise<boolean> {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║         🔨 PHASE 1: Building Apps             ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  if (dryRun) {
    console.log("[DRY RUN] Would run: bun run build");
    return true;
  }

  console.log("[INFO] Building all apps in parallel...");
  const result = await runCommand(
    ["bun", "run", "build"],
    rootDir,
    "Build"
  );

  if (!result.success) {
    console.error("[FATAL] Build failed");
    return false;
  }

  console.log("[✓] All apps built successfully\n");
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
    console.log(
      `    [DRY RUN] Would sync secrets for ${appName}`
    );
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

  console.log(`[INFO] Syncing secrets for ${appsWithSecrets.length} app(s)...\n`);

  const results = await Promise.all(
    appsWithSecrets.map((app) => syncAppSecrets(app))
  );

  const failed = appsWithSecrets.filter((_, i) => !results[i]);

  if (failed.length > 0) {
    console.warn(
      `[WARN] Failed to sync secrets for: ${failed.join(", ")}`
    );
    console.warn("[WARN] Deployment will continue, but secrets may not be available\n");
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

  console.log(`  📦 ${appName}`);
  console.log(`     → Project: ${appConfig.projectName}`);
  console.log(`     → Domain: https://${appConfig.domain}`);

  if (dryRun) {
    console.log(
      `     [DRY RUN] Would deploy: wrangler pages deploy out`
    );
    return { success: true, app: appName };
  }

  const result = await runCommand(
    ["wrangler", "pages", "deploy", "out", `--project-name=${appConfig.projectName}`],
    appDir,
    `Deploy ${appName}`,
    true
  );

  if (result.success) {
    console.log(`     ✓ Deployed successfully`);
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

  console.log(`[INFO] Deploying ${appsToDeployList.length} app(s)...\n`);

  const results = await Promise.all(
    appsToDeployList.map((app) => deployApp(app))
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

  console.log(
    `[✓] All ${succeeded.length} app(s) deployed successfully`
  );
  return true;
}

/**
 * Print final summary
 */
function printSummary(success: boolean) {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║              📊 DEPLOYMENT SUMMARY            ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  if (dryRun) {
    console.log("[DRY RUN MODE] No actual changes were made\n");
    return;
  }

  console.log("[APPS DEPLOYED]");
  for (const app of appsToDeployList) {
    const config = APPS_CONFIG[app];
    const status = success ? "✓" : "?";
    console.log(`  ${status} ${app} → https://${config.domain}`);
  }

  console.log("\n[NEXT STEPS]");
  if (success) {
    console.log(
      "  ✓ All deployments completed successfully"
    );
    console.log(
      "  ✓ Check your deployed apps at the domains above"
    );
    console.log(
      "  ✓ Verify functionality and monitor Cloudflare Pages dashboard"
    );
  } else {
    console.log(
      "  ✗ Some deployments failed"
    );
    console.log(
      "  ✗ Check the logs above for error details"
    );
    console.log(
      "  ✗ Ensure Cloudflare API credentials are configured"
    );
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

  console.log("\n[DEPLOYMENT PLAN]");
  console.log(`  Apps: ${appsToDeployList.join(", ")}`);
  console.log(`  Phase 1: Build all apps`);
  console.log(`  Phase 2: Sync secrets/env vars`);
  console.log(`  Phase 3: Deploy to Cloudflare Pages`);

  if (dryRun) {
    console.log("\n  MODE: DRY RUN (no actual changes will be made)");
  }

  // Build
  const buildSuccess = await buildAllApps();
  if (!buildSuccess) {
    process.exit(1);
  }

  // Config
  const configSuccess = await configPhase();
  if (!configSuccess) {
    console.warn("[WARN] Config phase had issues, continuing with deployment...");
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
