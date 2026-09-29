import type { ClickHouseClient } from "@clickhouse/client";
import { AICodePercentageSyncer } from "./ai-code-percentage.syncer";
import { CloudflareSyncer } from "./cloudflare.syncer";
import { GitHubSyncer } from "./github.syncer";
import { PostHogSyncer } from "./posthog.syncer";
import { UnsplashSyncer } from "./unsplash.syncer";
import { UnsplashPhotosSyncer } from "./unsplash-photos.syncer";
import { WakaTimeSyncer } from "./wakatime.syncer";
import { WakaTimeActivitySyncer } from "./wakatime-activity.syncer";
import { WakaTimeGoalsSyncer } from "./wakatime-goals.syncer";
import { WakaTimeProjectsSyncer } from "./wakatime-projects.syncer";
import { WakaTimeInsightsBestDaySyncer } from "./wakatime-insights-best-day.syncer";
import { WakaTimeInsightsWeekdaySyncer } from "./wakatime-insights-weekday.syncer";

export type SyncerConstructor = new (
  client: ClickHouseClient
) => {
  sync: (options?: any) => Promise<any>;
};

export const syncerMap: Record<string, SyncerConstructor> = {
  wakatime: WakaTimeSyncer,
  "wakatime-activity": WakaTimeActivitySyncer,
  "wakatime-goals": WakaTimeGoalsSyncer,
  "wakatime-projects": WakaTimeProjectsSyncer,
  "wakatime-insights-best-day": WakaTimeInsightsBestDaySyncer,
  "wakatime-insights-weekday": WakaTimeInsightsWeekdaySyncer,
  cloudflare: CloudflareSyncer,
  github: GitHubSyncer,
  unsplash: UnsplashSyncer,
  "unsplash-photos": UnsplashPhotosSyncer,
  posthog: PostHogSyncer,
  "ai-code-percentage": AICodePercentageSyncer,
};
