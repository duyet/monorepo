#!/usr/bin/env bun
/**
 * Sync secrets and environment variables for a single app to Cloudflare
 * Usage: bun sync-app-secrets.ts <app-name> [--dry-run]
 *
 * This script is called by each app's `bun run config` script
 *
 * For Pages projects:
 * - Syncs secrets (private vars) via wrangler pages secret bulk
 * - Syncs NEXT_PUBLIC_* build-time vars via wrangler pages secret put
 *
 * For Workers projects:
 * - Syncs all vars via wrangler secret bulk
 */

import { readFileSync, existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// CLI args
const appName = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!appName) {
  console.error(
    "[ERROR] App name required. Usage: bun sync-app-secrets.ts <app-name> [--dry-run]"
  );
  process.exit(1);
}

if (dryRun) {
  console.log("[INFO] Dry run mode - no changes will be made\n");
}

// Define which vars each app needs
const appConfig: Record<string, { secrets: string[]; buildVars: string[] }> = {
  "duyet-api": {
    secrets: [
      "OPENROUTER_API_KEY",
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_PORT",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_DATABASE",
      "CLICKHOUSE_PROTOCOL",
    ],
    buildVars: [],
  },
  "duyet-blog": {
    secrets: [
      "KV_URL",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
      "KV_REST_API_READ_ONLY_TOKEN",
      "POSTHOG_API_KEY",
      "POSTHOG_PROJECT_ID",
      "POSTGRES_URL",
      "POSTGRES_URL_NON_POOLING",
      "POSTGRES_PRISMA_URL",
      "POSTGRES_HOST",
      "POSTGRES_DATABASE",
      "POSTGRES_USER",
      "POSTGRES_PASSWORD",
    ],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
      "NEXT_PUBLIC_DUYET_API_URL",
      "NEXT_PUBLIC_AUTH0_ADMIN_EMAIL",
      "NEXT_PUBLIC_AUTH0_DOMAIN",
    ],
  },
  "duyet-insights": {
    secrets: [
      "GITHUB_TOKEN",
      "WAKATIME_API_KEY",
      "POSTHOG_API_KEY",
      "POSTHOG_PROJECT_ID",
      "CLOUDFLARE_API_KEY",
      "CLOUDFLARE_ZONE_ID",
      "CLOUDFLARE_EMAIL",
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_PORT",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_DATABASE",
      "CLICKHOUSE_PROTOCOL",
      "CLOUDFLARE_API_TOKEN",
    ],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
      "NEXT_PUBLIC_MEASUREMENT_ID",
    ],
  },
  "duyet-photos": {
    secrets: [
      "UNSPLASH_ACCESS_KEY",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "CLOUDINARY_CLOUD_NAME",
    ],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
      "UNSPLASH_USERNAME",
      "PHOTOS_OWNER_USERNAME",
    ],
  },
  "duyet-home": {
    secrets: [],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
      "NEXT_PUBLIC_DUYET_API_URL",
      "NEXT_PUBLIC_DUYET_AI_URL",
    ],
  },
  "duyet-cv": {
    secrets: [],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
    ],
  },
  "duyet-homelab": {
    secrets: [],
    buildVars: [
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "NEXT_PUBLIC_DUYET_CV_URL",
      "NEXT_PUBLIC_DUYET_HOMELAB_URL",
      "NEXT_PUBLIC_DUYET_INSIGHTS_URL",
      "NEXT_PUBLIC_DUYET_PHOTOS_URL",
      "NEXT_PUBLIC_DUYET_HOME_URL",
    ],
  },
};

function loadEnvFiles(): Record<string, string> {
  const env: Record<string, string> = {};

  // Helper to parse .env file content
  function parseEnvContent(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    }

    return result;
  }

  // 1. Load from root .env files (base configuration)
  const rootEnvFiles = [".env", ".env.local"];
  for (const file of rootEnvFiles) {
    const filePath = join(rootDir, file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    Object.assign(env, parseEnvContent(content));
  }

  // 2. Load from app-specific .env files (overrides root values)
  const dirName = appName.replace("duyet-", "");
  const appDir = join(rootDir, "apps", dirName);
  const appEnvFiles = [".env", ".env.local", ".env.production"];

  for (const file of appEnvFiles) {
    const appEnvPath = join(appDir, file);
    if (!existsSync(appEnvPath)) continue;

    const content = readFileSync(appEnvPath, "utf-8");
    Object.assign(env, parseEnvContent(content));
  }

  return env;
}

// Mapping from old NEXT_PUBLIC_ names to new secret names (for backwards compatibility)
const ENV_REMAPPING: Record<string, string> = {
  NEXT_PUBLIC_CLOUDFLARE_API_TOKEN: "CLOUDFLARE_API_TOKEN",
};

function getVarsForApp(
  appName: string,
  env: Record<string, string>
): { secrets: Record<string, string>; buildVars: Record<string, string> } {
  const config = appConfig[appName];
  if (!config) {
    return { secrets: {}, buildVars: {} };
  }

  const secrets: Record<string, string> = {};
  const buildVars: Record<string, string> = {};

  // Get secrets
  for (const key of config.secrets) {
    let value = env[key];

    // Check remapping for backwards compatibility
    if (!value) {
      for (const [oldName, newName] of Object.entries(ENV_REMAPPING)) {
        if (newName === key && env[oldName]) {
          value = env[oldName];
          break;
        }
      }
    }

    if (value) {
      secrets[key] = value;
    }
  }

  // Get build vars (for Pages projects)
  for (const key of config.buildVars) {
    const value = env[key];
    if (value) {
      buildVars[key] = value;
    }
  }

  return { secrets, buildVars };
}

async function setSecretsBulk(
  appName: string,
  secrets: Record<string, string>
): Promise<boolean> {
  if (dryRun || Object.keys(secrets).length === 0) {
    if (dryRun && Object.keys(secrets).length > 0) {
      console.log(
        `  [DRY RUN] Would sync ${Object.keys(secrets).length} secrets via bulk`
      );
    }
    return true;
  }

  try {
    // Convert duyet-api to api directory name
    const dirName = appName.replace("duyet-", "");
    const appDir = join(rootDir, "apps", dirName);

    // Create a temporary JSON file in the app directory
    const tmpFile = join(appDir, `.wrangler-seeds-${appName}.json`);
    writeFileSync(tmpFile, JSON.stringify(secrets, null, 2));

    // Check if this is a Pages project (has pages_build_output_dir) or Workers project
    const wranglerTomlPath = join(appDir, "wrangler.toml");
    const wranglerToml = readFileSync(wranglerTomlPath, "utf-8");
    const isPagesProject = wranglerToml.includes("pages_build_output_dir");

    // Use different commands for Pages vs Workers
    const cmd = isPagesProject
      ? ["wrangler", "pages", "secret", "bulk", tmpFile]
      : ["wrangler", "secret", "bulk", tmpFile];

    // Run wrangler from the app directory so it finds wrangler.toml
    const result = Bun.spawnSync({
      cmd,
      cwd: appDir,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env },
    });

    // Clean up temp file
    try {
      unlinkSync(tmpFile);
    } catch {
      // Ignore cleanup errors
    }

    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString();
      console.error(`  [ERROR] Failed to sync secrets: ${stderr}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  [ERROR] Exception syncing secrets:`, error);
    return false;
  }
}

async function setBuildVarsForPages(
  appName: string,
  buildVars: Record<string, string>
): Promise<boolean> {
  if (dryRun || Object.keys(buildVars).length === 0) {
    if (dryRun && Object.keys(buildVars).length > 0) {
      console.log(
        `  [DRY RUN] Would sync ${Object.keys(buildVars).length} build vars:`
      );
      for (const [key, value] of Object.entries(buildVars)) {
        console.log(`    - ${key}=${value}`);
      }
    }
    return true;
  }

  try {
    const dirName = appName.replace("duyet-", "");
    const appDir = join(rootDir, "apps", dirName);

    // Set each build var individually
    for (const [key, value] of Object.entries(buildVars)) {
      const cmd = ["wrangler", "pages", "secret", "put", key];

      const result = Bun.spawnSync({
        cmd,
        cwd: appDir,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
        input: value,
      });

      if (result.exitCode !== 0) {
        const stderr = result.stderr.toString();
        console.error(`  [ERROR] Failed to set ${key}: ${stderr}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`  [ERROR] Exception syncing build vars:`, error);
    return false;
  }
}

async function main() {
  console.log(`\n[${appName}] Syncing secrets and build vars...`);

  // Load environment variables from root
  const env = loadEnvFiles();
  if (Object.keys(env).length === 0) {
    console.error(
      `  [ERROR] No environment variables found in root .env files`
    );
    process.exit(1);
  }

  // Get vars for this app
  const { secrets, buildVars } = getVarsForApp(appName, env);

  // Check if this is a Pages project
  const dirName = appName.replace("duyet-", "");
  const appDir = join(rootDir, "apps", dirName);
  const wranglerTomlPath = join(appDir, "wrangler.toml");
  const wranglerToml = readFileSync(wranglerTomlPath, "utf-8");
  const isPagesProject = wranglerToml.includes("pages_build_output_dir");

  // Sync secrets
  const secretKeys = Object.keys(secrets);
  if (secretKeys.length > 0) {
    console.log(`  [INFO] Syncing ${secretKeys.length} secrets:`);
    for (const key of secretKeys) {
      const value = secrets[key];
      const masked =
        value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : "****";
      console.log(`    - ${key}: ${masked}`);
    }

    const result = await setSecretsBulk(appName, secrets);
    if (!result) {
      console.log(`  [ERROR] Failed to sync secrets`);
      process.exit(1);
    }
    console.log(`  [OK] Synced ${secretKeys.length} secrets`);
  } else {
    console.log(`  [INFO] No secrets to sync`);
  }

  // Sync build vars for Pages projects
  if (isPagesProject && Object.keys(buildVars).length > 0) {
    console.log(
      `  [INFO] Syncing ${Object.keys(buildVars).length} build vars for Pages:`
    );
    for (const [key, value] of Object.entries(buildVars)) {
      console.log(`    - ${key}=${value}`);
    }

    const result = await setBuildVarsForPages(appName, buildVars);
    if (!result) {
      console.log(`  [ERROR] Failed to sync build vars`);
      process.exit(1);
    }
    console.log(`  [OK] Synced ${Object.keys(buildVars).length} build vars`);
  } else if (isPagesProject) {
    console.log(`  [INFO] No build vars to sync`);
  }

  console.log(`  [OK] All vars synced successfully for ${appName}`);
}

main().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
