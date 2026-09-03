import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { planProductionDeploy } from "../src/lib/d1-deploy-plan.js";

const src = readFileSync(resolve(import.meta.dirname, "../wrangler.toml"), "utf8");
const plan = planProductionDeploy(src);
const productionHasD1 = /^\s*\[\[d1_databases\]\]/m.test(plan.toml);
const ok =
  (!productionHasD1 && !plan.applyMigrations) ||
  (productionHasD1 && !plan.stripD1 && plan.applyMigrations);

process.stdout.write(
  `${JSON.stringify({ ...plan, productionHasD1, ok }, null, 2)}\n`
);
process.exit(ok ? 0 : 1);
