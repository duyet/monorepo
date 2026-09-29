/**
 * Pure change detection for `scripts/cf-deploy.ts`.
 *
 * This is the logic that decides which apps get rebuilt, and therefore what
 * production actually ships. It was previously embedded in a 125-line
 * function that mixed the `spawnSync` git call, the console logging, and the
 * decision itself, so none of it was reachable from a unit test. Splitting the
 * decision out is the only way to pin the behaviour that a bad edit would
 * silently turn into a full (or empty) production rebuild.
 *
 * Note this is deliberately NOT the same policy as
 * `selectAppsToDeploy` in `cf-pages-apps.ts`, which drives the CI matrix.
 * The two watch different file sets (this one also treats `turbo.json` as
 * build-everything and reports `.env.production` / `scripts/cf-deploy.ts` as
 * deploy-only, while the matrix one keys off `.npmrc`) and this one falls back
 * to building everything when it detects no app changes. Unifying them would
 * change what gets deployed, so they stay separate.
 */

/**
 * Paths handed to `git diff --name-only`. Kept here so the list is covered by
 * a test: dropping `pnpm-lock.yaml` or `turbo.json` would mean a dependency or
 * task-graph change deploys stale builds.
 */
export const CHANGE_DETECTION_PATHS = [
  "apps/",
  "packages/",
  "turbo.json",
  "package.json",
  "pnpm-lock.yaml",
  ".env.production",
  "scripts/",
] as const;

/** Changed files that force a rebuild of every requested app. */
const CORE_CONFIG_FILES = ["turbo.json", "package.json", "pnpm-lock.yaml"];

/**
 * Changed files worth reporting but not worth a full rebuild on their own.
 * These are deployment inputs (secrets, the orchestrator itself) rather than
 * build inputs.
 */
const DEPLOY_ONLY_FILES = [".env.production", "scripts/cf-deploy.ts"];

export interface ChangeDetectionResult {
  /** Apps to build, in build order. */
  apps: string[];
  /**
   * Log lines explaining the decision, in the order they should be printed.
   * Returned rather than printed so the decision stays a pure function.
   */
  logLines: string[];
}

/**
 * Decide which of `requestedApps` to build for a set of changed files.
 *
 * @param changedFiles - Repo-relative paths from `git diff --name-only`.
 * @param requestedApps - Apps the orchestrator was asked to deploy.
 * @param targetApp - Explicit single-app target, if one was given on the CLI.
 */
export function selectAppsToBuild(opts: {
  changedFiles: string[];
  requestedApps: string[];
  targetApp?: string;
}): ChangeDetectionResult {
  const { changedFiles, requestedApps, targetApp } = opts;

  // Only apps the caller actually asked for are ever eligible.
  const changedApps = new Set<string>();
  for (const file of changedFiles) {
    if (!file.startsWith("apps/")) continue;
    const appName = file.split("/")[1];
    if (requestedApps.includes(appName)) {
      changedApps.add(appName);
    }
  }

  const sharedPackageChanges = changedFiles.filter((file) =>
    file.startsWith("packages/"),
  );
  const configChanges = changedFiles.filter((file) =>
    [...CORE_CONFIG_FILES, ...DEPLOY_ONLY_FILES].includes(file),
  );
  const coreConfigChanged = configChanges.some((file) =>
    CORE_CONFIG_FILES.includes(file),
  );

  if (sharedPackageChanges.length > 0 || coreConfigChanged) {
    const reasons: string[] = [];
    if (sharedPackageChanges.length > 0) {
      reasons.push(
        `shared packages changed (${sharedPackageChanges.length} files)`,
      );
    }
    if (coreConfigChanged) reasons.push("core config changed");
    return {
      apps: requestedApps,
      logLines: [`[INFO] Building all apps: ${reasons.join(", ")}`],
    };
  }

  const result = Array.from(changedApps);
  const logLines = [
    result.length > 0
      ? `[INFO] Changed apps detected: ${result.join(", ")}`
      : "[INFO] No app changes detected",
  ];

  if (configChanges.length > 0) {
    logLines.push(
      `[INFO] Config changes (deployment only): ${configChanges.join(", ")}`,
    );
  }

  if (result.length === 0) {
    // An explicit target is honoured even with an empty diff: the operator
    // asked for it by name.
    if (targetApp) {
      logLines.push(
        `[INFO] No changes detected, but building requested app: ${targetApp}`,
      );
      return { apps: [targetApp], logLines };
    }
    // Otherwise rebuild everything rather than deploy a stale set.
    logLines.push(
      "[INFO] No app changes detected. Building all apps for safety.",
    );
    return { apps: requestedApps, logLines };
  }

  return { apps: result, logLines };
}
