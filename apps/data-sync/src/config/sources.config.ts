export interface SourceConfig {
  name: string;
  enabled: boolean;
  schedule: string; // cron expression
  description: string;
}

export const sourceConfigs: Record<string, SourceConfig> = {
  wakatime: {
    name: "wakatime",
    enabled: true,
    schedule: "0 0 * * *", // Daily
    description: "WakaTime coding activity stats",
  },
  cloudflare: {
    name: "cloudflare",
    enabled: true,
    schedule: "0 1 * * *", // Daily at 1am
    description: "Cloudflare analytics data",
  },
  github: {
    name: "github",
    enabled: true,
    schedule: "0 */6 * * *", // Every 6 hours
    description: "GitHub contributions and events",
  },
  unsplash: {
    name: "unsplash",
    enabled: true,
    schedule: "0 2 * * 0", // Weekly on Sunday
    description: "Unsplash photo statistics",
  },
  posthog: {
    name: "posthog",
    enabled: true,
    schedule: "0 3 * * *", // Daily at 3am
    description: "PostHog analytics and user behavior",
  },
};

export const ALL_SOURCES = Object.keys(sourceConfigs);
