import type { ClickHouseClient } from "@clickhouse/client";
import { CloudflareSyncer } from "./cloudflare.syncer";
import { GitHubSyncer } from "./github.syncer";
import { UnsplashSyncer } from "./unsplash.syncer";
import { WakaTimeSyncer } from "./wakatime.syncer";

export { WakaTimeSyncer } from "./wakatime.syncer";
export { CloudflareSyncer } from "./cloudflare.syncer";
export { GitHubSyncer } from "./github.syncer";
export { UnsplashSyncer } from "./unsplash.syncer";

export type SyncerConstructor = new (
  client: ClickHouseClient
) => {
  sync: (options?: any) => Promise<any>;
};

export const syncerMap: Record<string, SyncerConstructor> = {
  wakatime: WakaTimeSyncer,
  cloudflare: CloudflareSyncer,
  github: GitHubSyncer,
  unsplash: UnsplashSyncer,
};

export const ALL_SYNCERS = Object.keys(syncerMap);
