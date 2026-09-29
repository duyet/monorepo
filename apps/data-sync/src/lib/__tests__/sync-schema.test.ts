/**
 * Contract between the columns a syncer's record carries and the columns its
 * target table declares.
 *
 * ClickHouse's JSONEachRow insert honours `input_format_skip_unknown_fields`
 * (1 by default), so a field a record carries but a table does not declare is
 * dropped without an error - a sync can look successful while writing none of
 * the data it computed. These assertions read the migration files as the
 * schema they produce (CREATE redefines, ADD COLUMN adds, DROP COLUMN
 * removes, in ascending version order) and check the two tables whose records
 * did not match.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const MIGRATIONS_DIR = fileURLToPath(
  new URL("../../../migrations/", import.meta.url)
);

interface Migration {
  version: number;
  name: string;
  file: string;
  up: string;
}

/** Drop `--` line comments, leaving anything inside a quoted string alone. */
function stripLineComments(sql: string): string {
  return sql
    .split("\n")
    .map((line) => {
      let quote: string | null = null;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (quote) {
          if (char === "\\") {
            i++;
          } else if (char === quote) {
            quote = null;
          }
          continue;
        }

        if (char === "'" || char === '"') {
          quote = char;
          continue;
        }

        if (char === "-" && line[i + 1] === "-") {
          return line.slice(0, i);
        }
      }

      return line;
    })
    .join("\n");
}

function loadMigrations(): Migration[] {
  const migrations: Migration[] = [];

  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    if (!file.endsWith(".sql")) continue;

    const content = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    const name = /-- @name:\s*(.+)/.exec(content)?.[1]?.trim();
    const version = Number.parseInt(
      /-- @version:\s*(\d+)/.exec(content)?.[1] ?? "",
      10
    );
    const up = content.split("-- UP")[1]?.split("-- DOWN")[0] ?? "";

    if (!name || !version) continue;

    // Comments are stripped once here so every parser below can match against
    // the SQL alone -- an inline comment after a column would otherwise read
    // as a column named "--".
    migrations.push({ version, name, file, up: stripLineComments(up) });
  }

  // The runner applies pending migrations in ascending version order.
  return migrations.sort((a, b) => a.version - b.version);
}

/**
 * Column names of `CREATE TABLE <table> (...)`, or null when this migration
 * does not create it. `ifNotExists` reports CREATE TABLE IF NOT EXISTS, which
 * leaves an existing table alone.
 */
function createdColumns(
  up: string,
  table: string
): { columns: string[]; parts: string[]; ifNotExists: boolean } | null {
  const match = new RegExp(
    `CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(`,
    "i"
  ).exec(up);

  if (!match) return null;

  const body = up.slice(match.index + match[0].length);
  const parts: string[] = [];
  let current = "";
  let depth = 1;

  for (const char of body) {
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0) break;
    } else if (char === "," && depth === 1) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);

  const definitions = parts
    .map((part) => part.trim())
    .filter((part) => !/^(INDEX|PARTITION|PRIMARY|CONSTRAINT)\b/i.test(part));

  return {
    ifNotExists: Boolean(match[1]),
    parts: definitions,
    columns: definitions.map((part) => part.split(/[\s(]+/)[0] as string),
  };
}

/** The declared type of one column, from the CREATE that defined the table. */
function columnType(table: string, column: string): string | undefined {
  let definition: string | undefined;

  for (const migration of loadMigrations()) {
    const created = createdColumns(migration.up, table);
    if (!created) continue;
    if (created.ifNotExists && definition !== undefined) continue;

    const index = created.columns.indexOf(column);
    definition =
      index === -1
        ? undefined
        : (created.parts[index] as string).split(/\s+/).slice(1).join(" ");
  }

  return definition;
}

/** The `ENGINE = ...` and `ORDER BY ...` clauses of `CREATE TABLE <table>`. */
function createdOptions(up: string, table: string) {
  const match = new RegExp(
    `CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(`,
    "i"
  ).exec(up);

  if (!match) return null;

  const body = up.slice(match.index + match[0].length);
  const closing = body.indexOf(")");
  const tail = closing === -1 ? "" : body.slice(closing + 1);

  return {
    engine: /ENGINE\s*=\s*([A-Za-z]+\s*\([^)]*\))/i.exec(tail)?.[1],
    orderBy: /ORDER\s+BY\s*\(([^)]*)\)/i.exec(tail)?.[1],
  };
}

/**
 * The columns a table ends up with once every migration has been applied, and
 * the engine/order-by of the CREATE that last defined it.
 */
function effectiveTable(table: string) {
  let columns: string[] | null = null;
  let options: ReturnType<typeof createdOptions> = null;
  let definedBy = "";

  for (const migration of loadMigrations()) {
    const created = createdColumns(migration.up, table);

    // A CREATE redefines the table; CREATE IF NOT EXISTS only fills a gap.
    if (created && (columns === null || !created.ifNotExists)) {
      columns = created.columns;
      options = createdOptions(migration.up, table);
      definedBy = migration.file;
    }

    const alter = new RegExp(
      `ALTER\\s+TABLE\\s+${table}\\b([\\s\\S]*?)(?=;|$)`,
      "gi"
    );
    for (const statement of migration.up.match(alter) ?? []) {
      const added =
        /ADD\s+COLUMN\s+(IF\s+NOT\s+EXISTS\s+)?([A-Za-z_]\w*)/i.exec(statement);
      const removed = /DROP\s+COLUMN\s+(IF\s+EXISTS\s+)?([A-Za-z_]\w*)/i.exec(
        statement
      );

      if (columns === null) continue;
      if (added) columns.push(added[2] as string);
      if (removed) columns = columns.filter((c) => c !== removed[2]);
    }
  }

  return { columns: columns ?? [], options, definedBy };
}

describe("github_commits_raw (ai-code-percentage target)", () => {
  // BaseSyncer.insert adds exactly these three to every record before writing
  // it (src/lib/base/syncer.ts). github_commits_raw declared none of them, so
  // all three were dropped on insert.
  const SYNC_METADATA_COLUMNS = ["sync_version", "is_deleted", "synced_at"];

  test("declares the sync metadata BaseSyncer.insert writes", () => {
    const { columns } = effectiveTable("github_commits_raw");

    for (const column of SYNC_METADATA_COLUMNS) {
      expect(columns).toContain(column);
    }
  });

  test("deduplicates on sync_version instead of appending", () => {
    const { options } = effectiveTable("github_commits_raw");

    expect(options?.engine).toMatch(/ReplacingMergeTree\(\s*sync_version/);
    expect(options?.engine).not.toMatch(/^MergeTree/);
  });

  // ReplacingMergeTree collapses rows that share the sort key, so the key has
  // to identify a commit. Without `sha`, two commits in the same repo in the
  // same second share a key and one of them is lost on merge.
  test("keys the sort order on the commit", () => {
    const { options } = effectiveTable("github_commits_raw");

    expect(options?.orderBy).toMatch(/sha/);
  });
});

describe("monorepo_posthog (posthog target)", () => {
  // PostHogSyncer's PostHogPathRecord.
  const RECORD_COLUMNS = ["date", "path", "visitors", "views", "sessions"];

  test("declares every column the syncer's record carries", () => {
    const { columns } = effectiveTable("monorepo_posthog");

    for (const column of RECORD_COLUMNS) {
      expect(columns).toContain(column);
    }
  });

  // bounce_rate is never written and never read, but it is Nullable so it
  // costs nothing to keep declared, and keeping it keeps this migration
  // additive. If someone makes it non-Nullable, syncs that omit it break.
  test("keeps the unread bounce_rate column nullable", () => {
    expect(columnType("monorepo_posthog", "bounce_rate")).toMatch(/^Nullable/);
  });
});

describe("migration files", () => {
  test("every migration declares a unique version and a name", () => {
    const migrations = loadMigrations();
    const versions = migrations.map((migration) => migration.version);

    expect(new Set(versions).size).toBe(migrations.length);
    expect(migrations.every((migration) => migration.name.length > 0)).toBe(
      true
    );
  });

  // The runner applies pending migrations in ascending version order, so a new
  // migration that has to see 20250109's table shape needs a version above it.
  test("the raw-commits rebuild is ordered after 20250109", () => {
    const rebuild = loadMigrations().find(
      (migration) => migration.name === "github_commits_raw_sync_metadata"
    );
    const superseded = loadMigrations().find(
      (migration) => migration.name === "github_commits_raw"
    );

    expect(superseded).toBeDefined();
    expect(rebuild).toBeDefined();
    expect(rebuild?.version).toBeGreaterThan(superseded?.version ?? 0);
  });
});
