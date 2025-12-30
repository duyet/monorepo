#!/usr/bin/env bun

function printHelp() {
  console.log(`
Data Sync CLI

Usage:
  bun run <command> [options]

Commands:
  sync [sources...]    Sync data from external sources
  migrate <action>     Manage database migrations
  cleanup              Run retention cleanup

Sync Command:
  bun run sync all                    Sync all enabled sources
  bun run sync wakatime               Sync specific source
  bun run sync wakatime cloudflare    Sync multiple sources
  bun run sync all --dry-run          Preview without writing

Migration Commands:
  bun run migrate up                  Apply pending migrations
  bun run migrate down                Rollback last migration
  bun run migrate down --count 2      Rollback N migrations
  bun run migrate status              Show migration status
  bun run migrate verify              Verify checksums

Cleanup Command:
  bun run cleanup                     Run retention cleanup
  bun run cleanup --dry-run           Preview cleanup

Available Sources:
  - wakatime      WakaTime coding activity stats
  - cloudflare    Cloudflare analytics data
  - github        GitHub contributions and events
  - unsplash      Unsplash photo statistics

Examples:
  bun run sync all
  bun run migrate up
  bun run cleanup --dry-run

For more information, visit: https://github.com/duyet/monorepo
`);
}

async function main() {
  const command = process.argv[2];

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "sync":
      await import("./commands/sync");
      break;

    case "migrate":
      await import("./commands/migrate");
      break;

    case "cleanup":
      await import("./commands/cleanup");
      break;

    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Command failed:", error);
  process.exit(1);
});
