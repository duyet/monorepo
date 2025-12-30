#!/usr/bin/env bun
import { join } from "node:path";
import { logger } from "../lib";
import { MigrationRunner, closeClient } from "../lib/clickhouse";

const MIGRATIONS_DIR = join(import.meta.dir, "../../migrations");

function printHelp() {
  console.log(`
Database Migration Tool

Usage:
  bun run migrate <command> [options]

Commands:
  up              Apply pending migrations
  down            Rollback last migration
  status          Show migration status
  verify          Verify migration checksums

Options:
  --count N       Number of migrations to rollback (use with down)

Examples:
  bun run migrate up
  bun run migrate down
  bun run migrate down --count 2
  bun run migrate status
  bun run migrate verify
`);
}

async function printStatus(runner: MigrationRunner) {
  const status = await runner.status();

  console.log(`\n${"=".repeat(60)}`);
  logger.info("MIGRATION STATUS");
  console.log("=".repeat(60));

  console.log(`Total migrations:   ${status.total}`);
  console.log(
    `${"\x1b[32m"}Applied:${"\x1b[0m"}            ${status.appliedCount}`
  );
  console.log(
    `${"\x1b[33m"}Pending:${"\x1b[0m"}            ${status.pendingCount}`
  );

  if (status.applied.length > 0) {
    console.log(`\n${"Applied Migrations:".padEnd(60, "-")}`);
    for (const migration of status.applied) {
      const date = new Date(migration.applied_at).toISOString().split("T")[0];
      console.log(
        `  ${"\x1b[32m"}✓${"\x1b[0m"} v${migration.version.toString().padEnd(3)} ${migration.name.padEnd(30)} ${date}`
      );
    }
  }

  if (status.pending.length > 0) {
    console.log(`\n${"Pending Migrations:".padEnd(60, "-")}`);
    for (const migration of status.pending) {
      console.log(
        `  ${"\x1b[33m"}•${"\x1b[0m"} v${migration.version.toString().padEnd(3)} ${migration.name}`
      );
    }
  }

  console.log(`${"=".repeat(60)}\n`);
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command || command === "help" || command === "--help") {
    printHelp();
    process.exit(0);
  }

  const runner = new MigrationRunner(MIGRATIONS_DIR);

  try {
    // Initialize migrations table
    await runner.init();

    switch (command) {
      case "up": {
        logger.info("Applying pending migrations...");
        await runner.up();
        logger.info("Migrations applied successfully");
        await printStatus(runner);
        break;
      }

      case "down": {
        const count = args.includes("--count")
          ? Number.parseInt(args[args.indexOf("--count") + 1], 10) || 1
          : 1;

        logger.info(`Rolling back ${count} migration(s)...`);
        await runner.down(count);
        logger.info("Rollback completed successfully");
        await printStatus(runner);
        break;
      }

      case "status": {
        await printStatus(runner);
        break;
      }

      case "verify": {
        logger.info("Verifying migration checksums...");
        const valid = await runner.verify();

        if (valid) {
          logger.info("All migration checksums are valid");
          process.exit(0);
        } else {
          logger.error("Migration checksum verification failed");
          process.exit(1);
        }
        break;
      }

      default: {
        logger.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Migration command failed: ${errorMsg}`);
    process.exit(1);
  } finally {
    await closeClient();
  }
}

main().catch((error) => {
  logger.error("Migration command failed:", error);
  process.exit(1);
});
