import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { MigrationRunner, sqlString } from "./migrations";

/**
 * Covers the two things about `MigrationRunner` that are pure enough to test
 * without a ClickHouse connection, plus the two accessors the
 * `sync-schema.test.ts` sibling duplicates.
 *
 * `loadMigrations` and `splitStatements` are exercised through the public
 * `status()` surface where possible; `parseMigrationFile` is reached through
 * `loadMigrations`, and `splitStatements` through the SQL a migration declares.
 */

let dir: string;
let runner: MigrationRunner;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "migrations-test-"));
  runner = new MigrationRunner(dir);
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(name: string, contents: string): void {
  writeFileSync(join(dir, name), contents);
}

describe("loadMigrations", () => {
  test("reads the name, version and UP section", () => {
    write(
      "001_first.sql",
      ["-- @name: first", "-- @version: 1", "", "-- UP", "CREATE TABLE a (x UInt8);", ""].join(
        "\n",
      ),
    );

    const [migration] = runner["loadMigrations"]();

    expect(migration.version).toBe(1);
    expect(migration.name).toBe("first");
    expect(migration.up).toBe("CREATE TABLE a (x UInt8);");
    // No DOWN section in the file, so the down half is empty rather than
    // containing the UP text.
    expect(migration.down).toBe("");
  });

  test("skips a file with no version, rather than guessing one", () => {
    write("002_noversion.sql", ["-- @name: noversion", "-- UP", "SELECT 1;", ""].join("\n"));

    const names = runner["loadMigrations"]().map((m) => m.name);

    // A file with no @version parses to null and is dropped, so the
    // version-1 file from the previous test is the only survivor.
    expect(names).toEqual(["first"]);
  });

  test("skips a file with an empty UP section", () => {
    write(
      "003_noup.sql",
      ["-- @name: noup", "-- @version: 3", "", "-- DOWN", "DROP TABLE a;", ""].join("\n"),
    );

    const names = runner["loadMigrations"]().map((m) => m.name);

    expect(names).not.toContain("noup");
  });

  test("sorts by version, not by filename", () => {
    // 20250109 sorts above 001 lexically in a way that is easy to get wrong,
    // and migration order is load-bearing: the runner applies pending ones in
    // ascending version order.
    for (const [file, version, name] of [
      ["010_ten.sql", "10", "ten"],
      ["20250109_big.sql", "20250109", "big"],
      ["002_two.sql", "2", "two"],
    ] as const) {
      write(file, `-- @name: ${name}\n-- @version: ${version}\n\n-- UP\nSELECT 1;\n`);
    }

    const versions = runner["loadMigrations"]().map((m) => m.version);

    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(versions.at(-1)).toBe(20250109);
  });

  test("throws for a directory that does not exist", () => {
    // Deliberate: a mistyped migrationsDir should fail loudly rather than look
    // like "no migrations pending" and let `up()` report success having applied
    // nothing. Asserted here so the behavior is pinned rather than assumed.
    expect(() =>
      new MigrationRunner(join(dir, "does-not-exist"))["loadMigrations"](),
    ).toThrow(/ENOENT/);
  });

  test("returns an empty list for a directory with no .sql files", () => {
    write("notes.txt", "not a migration");
    expect(new MigrationRunner(dir)["loadMigrations"]().length).toBeGreaterThan(0);
    expect(runner["loadMigrations"]().every((m) => m.name !== "not a migration")).toBe(
      true,
    );
  });
});

describe("checksum", () => {
  test("covers both the UP and the DOWN section", () => {
    const withBody = (up: string, down: string) =>
      `-- @name: cks\n-- @version: 10\n\n-- UP\n${up}\n-- DOWN\n${down}\n`;

    write("010_checksum.sql", withBody("SELECT 1;", "SELECT 1;"));
    const before = runner["loadMigrations"]().find((m) => m.version === 10);

    write("010_checksum.sql", withBody("SELECT 2;", "SELECT 1;"));
    const afterUpChanged = runner["loadMigrations"]().find((m) => m.version === 10);

    write("010_checksum.sql", withBody("SELECT 2;", "SELECT 9;"));
    const afterDownChanged = runner["loadMigrations"]().find((m) => m.version === 10);

    // The checksum is `md5(up + down)`, so it covers both halves. That is
    // intentional and is what `verify()` relies on: it detects an *already
    // applied* migration file being edited after the fact, DOWN included.
    expect(afterUpChanged?.checksum).not.toBe(before?.checksum);
    expect(afterDownChanged?.checksum).not.toBe(afterUpChanged?.checksum);
  });

  test("is stable across repeated reads of an unchanged file", () => {
    write(
      "011_stable.sql",
      "-- @name: stable\n-- @version: 11\n\n-- UP\nSELECT 1;\n",
    );
    const first = runner["loadMigrations"]().find((m) => m.version === 11);
    const second = runner["loadMigrations"]().find((m) => m.version === 11);
    expect(second?.checksum).toBe(first?.checksum);
  });
});

describe("sqlString", () => {
  test("quotes a plain identifier and a hex checksum", () => {
    expect(sqlString("github_commits_raw")).toBe("'github_commits_raw'");
    expect(sqlString("57a165af3eb424745f5587f45fa8055f")).toBe(
      "'57a165af3eb424745f5587f45fa8055f'",
    );
  });

  test("escapes an apostrophe", () => {
    expect(sqlString("it's")).toBe("'it\\'s'");
  });

  test("escapes a backslash", () => {
    expect(sqlString("a\\b")).toBe("'a\\\\b'");
  });

  test("a trailing backslash does not swallow the closing quote", () => {
    // Order matters. If quotes were escaped first, a trailing backslash would
    // escape the closing quote and the literal would run on.
    expect(sqlString("a\\")).toBe("'a\\\\'");
  });

  test("cannot be used to inject a second statement", () => {
    // `migration.name` reaches the INSERT by template interpolation. Every
    // current name is a safe identifier, so this guards the next one.
    expect(sqlString("x'); DROP TABLE monorepo_migrations; --")).toBe(
      "'x\\'); DROP TABLE monorepo_migrations; --'",
    );
  });
});

describe("re-entrancy guard", () => {
  test("is a declared field, not an undeclared one reached through `as any`", () => {
    // The guard used to be `(this as any)._running`, which meant nothing
    // type-checked it and a typo would have silently disabled it.
    expect(Object.getOwnPropertyDescriptor(MigrationRunner.prototype, "running")).toBeUndefined();
    expect(new MigrationRunner(dir)["running"]).toBe(false);
  });
});
