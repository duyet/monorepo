import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  executeCommand,
  executeQuery,
  executeStatements,
  getClient,
} from "./client";

/**
 * Migration interface
 */
export interface Migration {
  version: number;
  name: string;
  up: string;
  down: string;
  checksum: string;
  filePath: string;
}

/**
 * Applied migration interface (from database)
 */
export interface AppliedMigration {
  version: number;
  name: string;
  checksum: string;
  applied_at: string;
}

/**
 * Migration status interface
 */
export interface MigrationStatus {
  pending: Migration[];
  applied: AppliedMigration[];
  total: number;
  pendingCount: number;
  appliedCount: number;
}

/**
 * Calculate MD5 checksum for migration content
 */
function calculateChecksum(content: string): string {
  return createHash("md5").update(content).digest("hex");
}

/**
 * Parse SQL migration file
 * Format:
 * -- @name: migration_name
 * -- @version: 1
 *
 * -- UP
 * CREATE TABLE ...
 *
 * -- DOWN
 * DROP TABLE ...
 */
function parseMigrationFile(filePath: string): Migration | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let name = "";
    let version = 0;
    let upSection = false;
    let downSection = false;
    const upStatements: string[] = [];
    const downStatements: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse metadata
      if (trimmed.startsWith("-- @name:")) {
        name = trimmed.replace("-- @name:", "").trim();
        continue;
      }

      if (trimmed.startsWith("-- @version:")) {
        version = Number.parseInt(
          trimmed.replace("-- @version:", "").trim(),
          10
        );
        continue;
      }

      // Section markers
      if (trimmed === "-- UP") {
        upSection = true;
        downSection = false;
        continue;
      }

      if (trimmed === "-- DOWN") {
        upSection = false;
        downSection = true;
        continue;
      }

      // Skip comments and empty lines
      if (trimmed.startsWith("--") || !trimmed) {
        continue;
      }

      // Collect statements
      if (upSection) {
        upStatements.push(line);
      } else if (downSection) {
        downStatements.push(line);
      }
    }

    if (!name || !version) {
      console.error("[Migration Parser] Missing name or version in:", filePath);
      return null;
    }

    const up = upStatements.join("\n").trim();
    const down = downStatements.join("\n").trim();

    if (!up) {
      console.error("[Migration Parser] Missing UP section in:", filePath);
      return null;
    }

    const checksum = calculateChecksum(up + down);

    return {
      version,
      name,
      up,
      down,
      checksum,
      filePath,
    };
  } catch (error) {
    console.error("[Migration Parser] Failed to parse file:", filePath, error);
    return null;
  }
}

/**
 * Split SQL content into individual statements
 */
function splitStatements(sql: string): string[] {
  // Split by semicolon, but preserve them within strings
  const statements: string[] = [];
  let currentStatement = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      currentStatement += char;
    } else if (inString && char === stringChar && sql[i - 1] !== "\\") {
      inString = false;
      currentStatement += char;
    } else if (!inString && char === ";") {
      const trimmed = currentStatement.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      currentStatement = "";
    } else {
      currentStatement += char;
    }
  }

  // Add last statement if exists
  const trimmed = currentStatement.trim();
  if (trimmed) {
    statements.push(trimmed);
  }

  return statements;
}

/**
 * Migration runner class
 */
export class MigrationRunner {
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
  }

  /**
   * Initialize migrations table
   */
  async init(): Promise<void> {
    console.log("[Migration Runner] Initializing migrations table...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS monorepo_migrations (
        version UInt32,
        name String,
        checksum String,
        applied_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY version
    `;

    const result = await executeQuery(createTableQuery);

    if (!result.success) {
      throw new Error(`Failed to create migrations table: ${result.error}`);
    }

    console.log("[Migration Runner] Migrations table ready");
  }

  /**
   * Load all migration files from directory
   */
  private loadMigrations(): Migration[] {
    console.log(
      "[Migration Runner] Loading migrations from:",
      this.migrationsDir
    );

    const files = readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = join(this.migrationsDir, file);
      const migration = parseMigrationFile(filePath);

      if (migration) {
        migrations.push(migration);
      }
    }

    console.log("[Migration Runner] Loaded migrations:", migrations.length);
    return migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get applied migrations from database
   */
  async getApplied(): Promise<AppliedMigration[]> {
    const client = getClient();
    if (!client) {
      throw new Error("ClickHouse client not available");
    }

    const query =
      "SELECT version, name, checksum, applied_at FROM monorepo_migrations ORDER BY version";
    const result = await executeQuery(query);

    if (!result.success) {
      throw new Error(`Failed to get applied migrations: ${result.error}`);
    }

    return result.data as unknown as AppliedMigration[];
  }

  /**
   * Get pending migrations
   */
  async getPending(): Promise<Migration[]> {
    const allMigrations = this.loadMigrations();
    const applied = await this.getApplied();
    const appliedVersions = new Set(applied.map((m) => m.version));

    const pending = allMigrations.filter(
      (m) => !appliedVersions.has(m.version)
    );

    console.log("[Migration Runner] Pending migrations:", pending.length);
    return pending;
  }

  /**
   * Get migration status
   */
  async status(): Promise<MigrationStatus> {
    const allMigrations = this.loadMigrations();
    const applied = await this.getApplied();
    const pending = await this.getPending();

    return {
      pending,
      applied,
      total: allMigrations.length,
      pendingCount: pending.length,
      appliedCount: applied.length,
    };
  }

  /**
   * Apply pending migrations (migrate up)
   */
  async up(): Promise<void> {
    console.log("[Migration Runner] Running UP migrations...");

    const pending = await this.getPending();

    if (pending.length === 0) {
      console.log("[Migration Runner] No pending migrations");
      return;
    }

    for (const migration of pending) {
      console.log(
        `[Migration Runner] Applying migration ${migration.version}: ${migration.name}`
      );

      try {
        // Execute UP statements
        const statements = splitStatements(migration.up);
        const result = await executeStatements(statements);

        if (!result.success) {
          throw new Error(`Migration failed: ${result.error}`);
        }

        // Record migration using executeCommand (not executeQuery)
        const insertQuery = `
          INSERT INTO monorepo_migrations (version, name, checksum)
          VALUES (${migration.version}, '${migration.name}', '${migration.checksum}')
        `;

        const insertResult = await executeCommand(insertQuery);

        if (!insertResult.success) {
          throw new Error(`Failed to record migration: ${insertResult.error}`);
        }

        console.log(
          `[Migration Runner] Successfully applied migration ${migration.version}`
        );
      } catch (error) {
        console.error(
          `[Migration Runner] Failed to apply migration ${migration.version}:`,
          error
        );
        throw error;
      }
    }

    console.log("[Migration Runner] All migrations applied successfully");
  }

  /**
   * Rollback migrations (migrate down)
   */
  async down(count = 1): Promise<void> {
    console.log(`[Migration Runner] Rolling back ${count} migration(s)...`);

    const applied = await this.getApplied();

    if (applied.length === 0) {
      console.log("[Migration Runner] No migrations to rollback");
      return;
    }

    const toRollback = applied
      .sort((a, b) => b.version - a.version)
      .slice(0, count);

    const allMigrations = this.loadMigrations();

    for (const appliedMigration of toRollback) {
      const migration = allMigrations.find(
        (m) => m.version === appliedMigration.version
      );

      if (!migration) {
        console.error(
          `[Migration Runner] Migration file not found for version ${appliedMigration.version}`
        );
        continue;
      }

      if (!migration.down) {
        console.error(
          `[Migration Runner] No DOWN section for migration ${migration.version}`
        );
        continue;
      }

      console.log(
        `[Migration Runner] Rolling back migration ${migration.version}: ${migration.name}`
      );

      try {
        // Execute DOWN statements
        const statements = splitStatements(migration.down);
        const result = await executeStatements(statements);

        if (!result.success) {
          throw new Error(`Rollback failed: ${result.error}`);
        }

        // Remove migration record
        const deleteQuery = `
          ALTER TABLE monorepo_migrations
          DELETE WHERE version = ${migration.version}
        `;

        const deleteResult = await executeQuery(deleteQuery);

        if (!deleteResult.success) {
          throw new Error(
            `Failed to remove migration record: ${deleteResult.error}`
          );
        }

        console.log(
          `[Migration Runner] Successfully rolled back migration ${migration.version}`
        );
      } catch (error) {
        console.error(
          `[Migration Runner] Failed to rollback migration ${migration.version}:`,
          error
        );
        throw error;
      }
    }

    console.log("[Migration Runner] Rollback completed");
  }

  /**
   * Verify migration checksums
   */
  async verify(): Promise<boolean> {
    console.log("[Migration Runner] Verifying migration checksums...");

    const allMigrations = this.loadMigrations();
    const applied = await this.getApplied();

    let valid = true;

    for (const appliedMigration of applied) {
      const migration = allMigrations.find(
        (m) => m.version === appliedMigration.version
      );

      if (!migration) {
        console.error(
          `[Migration Verify] Migration file not found for version ${appliedMigration.version}`
        );
        valid = false;
        continue;
      }

      if (migration.checksum !== appliedMigration.checksum) {
        console.error(
          `[Migration Verify] Checksum mismatch for version ${appliedMigration.version}:`,
          `expected ${appliedMigration.checksum}, got ${migration.checksum}`
        );
        valid = false;
      }
    }

    if (valid) {
      console.log("[Migration Runner] All checksums verified successfully");
    }

    return valid;
  }
}
