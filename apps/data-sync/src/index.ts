#!/usr/bin/env tsx

function printHelp() {
  console.log(`
Data Sync CLI

Usage:
  pnpm run start -- <command> [options]

Commands:
  sync [sources...]    Sync data from external sources
  migrate <action>     Manage database migrations
  cleanup              Run retention cleanup

Sync Command:
  pnpm run sync -- all                    Sync all enabled sources
  pnpm run sync -- wakatime               Sync specific source
  pnpm run sync -- wakatime cloudflare    Sync multiple sources
  pnpm run sync -- all --dry-run          Preview without writing

Migration Commands:
  pnpm run migrate -- up                  Apply pending migrations
  pnpm run migrate -- down                Rollback last migration
  pnpm run migrate -- down --count 2      Rollback N migrations
  pnpm run migrate -- status              Show migration status
  pnpm run migrate -- verify              Verify checksums

Cleanup Command:
  pnpm run cleanup                     Run retention cleanup
  pnpm run cleanup -- --dry-run       Preview cleanup

Available Sources:
  - wakatime      WakaTime coding activity stats
  - cloudflare    Cloudflare analytics data
  - github        GitHub contributions and events
  - unsplash      Unsplash photo statistics

Examples:
  pnpm run sync -- all
  pnpm run migrate -- up
  pnpm run cleanup -- --dry-run

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
