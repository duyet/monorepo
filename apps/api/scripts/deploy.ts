import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { planProductionDeploy } from "../src/lib/d1-deploy-plan.js";

const root = resolve(import.meta.dirname, "..");
const srcPath = resolve(root, "wrangler.toml");
const tmpPath = resolve(root, ".wrangler-deploy.toml");
const src = readFileSync(srcPath, "utf8");
const plan = planProductionDeploy(src);
const usesTmp = plan.toml !== src;

if (usesTmp) {
  writeFileSync(tmpPath, plan.toml);
}

const wrangler = (args: string[]) =>
  spawnSync("pnpm", ["dlx", "wrangler", ...args], {
    cwd: root,
    stdio: "inherit",
  });

try {
  const deploy = wrangler(
    usesTmp ? ["deploy", "--config", tmpPath] : ["deploy"]
  );
  if (deploy.status !== 0) {
    process.exit(deploy.status ?? 1);
  }
  if (plan.applyMigrations) {
    const migrations = wrangler([
      "d1",
      "migrations",
      "apply",
      "SUBMISSIONS_DB",
      "--remote",
    ]);
    if (migrations.status !== 0) {
      process.exit(migrations.status ?? 1);
    }
  } else {
    console.info(plan.reason);
  }
} finally {
  if (usesTmp && existsSync(tmpPath)) {
    unlinkSync(tmpPath);
  }
}
