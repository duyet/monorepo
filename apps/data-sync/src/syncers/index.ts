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

export { AICodePercentageSyncer } from "./ai-code-percentage.syncer";
export { CloudflareSyncer } from "./cloudflare.syncer";
export { GitHubSyncer } from "./github.syncer";
export { PostHogSyncer } from "./posthog.syncer";
export { UnsplashSyncer } from "./unsplash.syncer";
export { UnsplashPhotosSyncer } from "./unsplash-photos.syncer";
export { WakaTimeSyncer } from "./wakatime.syncer";
export { WakaTimeActivitySyncer } from "./wakatime-activity.syncer";
export { WakaTimeGoalsSyncer } from "./wakatime-goals.syncer";
export { WakaTimeProjectsSyncer } from "./wakatime-projects.syncer";
export { WakaTimeInsightsBestDaySyncer } from "./wakatime-insights-best-day.syncer";
export { WakaTimeInsightsWeekdaySyncer } from "./wakatime-insights-weekday.syncer";

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

export const ALL_SYNCERS = Object.keys(syncerMap);
