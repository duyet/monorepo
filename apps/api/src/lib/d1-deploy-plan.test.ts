import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isD1DatabaseId,
  planProductionDeploy,
  SKIP_D1_REASON,
} from "./d1-deploy-plan.js";

const FIXTURE_UUID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

const NAMELESS_D1 = `name = "duyet-api"
main = "dist/index.js"

[[d1_databases]]
binding = "SUBMISSIONS_DB"
database_name = "duyet-api-submissions"
migrations_dir = "migrations"

[[send_email]]
name = "NOTIFY_EMAIL"
destination_address = "me@duyet.net"
`;

describe("isD1DatabaseId", () => {
  it("accepts a D1 UUID", () => {
    expect(isD1DatabaseId(FIXTURE_UUID)).toBe(true);
  });

  it("rejects placeholders and empty values", () => {
    expect(isD1DatabaseId("")).toBe(false);
    expect(isD1DatabaseId("duyet-api-submissions")).toBe(false);
    expect(isD1DatabaseId("<unique-ID-for-your-database>")).toBe(false);
  });
});

describe("planProductionDeploy", () => {
  it("omits nameless D1 so wrangler deploy does not hit /d1/database/<name>", () => {
    const plan = planProductionDeploy(NAMELESS_D1);
    expect(plan.stripD1).toBe(true);
    expect(plan.applyMigrations).toBe(false);
    expect(plan.reason).toBe(SKIP_D1_REASON);
    expect(plan.toml).not.toMatch(/\[\[d1_databases\]\]/);
    expect(plan.toml).not.toContain("duyet-api-submissions");
    expect(plan.toml).toContain('name = "duyet-api"');
    expect(plan.toml).toContain("[[send_email]]");
    expect(plan.toml).toContain('destination_address = "me@duyet.net"');
  });

  it("keeps a UUID D1 binding and applies remote migrations", () => {
    const source = `name = "duyet-api"

[[d1_databases]]
binding = "SUBMISSIONS_DB"
database_name = "duyet-api-submissions"
database_id = "${FIXTURE_UUID}"
migrations_dir = "migrations"
`;
    const plan = planProductionDeploy(source);
    expect(plan.stripD1).toBe(false);
    expect(plan.applyMigrations).toBe(true);
    expect(plan.toml).toContain("[[d1_databases]]");
    expect(plan.toml).toContain(`database_id = "${FIXTURE_UUID}"`);
  });

  it("strips a placeholder database_id the same as a missing one", () => {
    const source = `name = "duyet-api"

[[d1_databases]]
binding = "SUBMISSIONS_DB"
database_name = "duyet-api-submissions"
database_id = "REPLACE_ME"
`;
    const plan = planProductionDeploy(source);
    expect(plan.stripD1).toBe(true);
    expect(plan.applyMigrations).toBe(false);
    expect(plan.toml).not.toMatch(/\[\[d1_databases\]\]/);
  });

  it("never leaves nameless D1 in the production plan for committed wrangler.toml", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "../../wrangler.toml"),
      "utf8"
    );
    const plan = planProductionDeploy(source);
    if (plan.applyMigrations) {
      expect(plan.stripD1).toBe(false);
      expect(plan.toml).toMatch(/database_id = "[0-9a-f-]{36}"/i);
    } else {
      expect(source).toContain("[[d1_databases]]");
      expect(plan.stripD1).toBe(true);
      expect(plan.toml).not.toMatch(/\[\[d1_databases\]\]/);
    }
    expect(plan.toml).toContain('name = "duyet-api"');
    expect(plan.toml).toContain("[[send_email]]");
  });
});
