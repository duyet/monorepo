import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

const WAKATIME_API_BASE_URL = "https://wakatime.com/api/v1";

const RANGES = [
  "last_7_days",
  "last_30_days",
  "last_year",
  "all_time",
] as const;

type InsightRange = (typeof RANGES)[number];

interface WeekdayBucket {
  id: number;      // 0-6 (Sunday-Saturday per WakaTime)
  name: string;    // e.g. "Sunday"
  total: number;
  average: number;
  percent?: number;
}

interface WeekdayInsightResponse {
  data?: WeekdayBucket[];
}

// Internal envelope carries the range alongside individual buckets
interface WeekdayWithRange {
  range: InsightRange;
  weekday: number;
  name: string;
  total_seconds: number;
  average_seconds: number;
}

interface WakaTimeWeekdayRecord {
  range: string;
  weekday: number;
  name: string;
  total_seconds: number;
  average_seconds: number;
}

export class WakaTimeInsightsWeekdaySyncer extends BaseSyncer<
  WeekdayWithRange,
  WakaTimeWeekdayRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "wakatime-insights-weekday");
  }

  protected getTableName(): string {
    return "monorepo_wakatime_insights_weekday";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<WeekdayWithRange[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    this.logger.info("Fetching WakaTime weekday insights for all ranges");

    const results: WeekdayWithRange[] = [];

    for (const range of RANGES) {
      const url = `${WAKATIME_API_BASE_URL}/users/current/insights/weekday/${range}?api_key=${apiKey}`;

      try {
        const response = await this.withRetry(async () => {
          const res = await fetch(url, {
            headers: { "User-Agent": "data-sync-app" },
          });

          if (!res.ok) {
            if (res.status === 401) {
              throw new Error(
                "WakaTime API authentication failed: Invalid or expired API key"
              );
            }
            if (res.status === 429) {
              throw new Error("WakaTime API rate limit exceeded");
            }
            throw new Error(
              `WakaTime API error: ${res.status} ${res.statusText}`
            );
          }

          return res.json() as Promise<WeekdayInsightResponse>;
        });

        const buckets = response?.data;
        if (!Array.isArray(buckets) || buckets.length === 0) {
          this.logger.warn(`No weekday data returned for range ${range}`);
          await this.sleep(200);
          continue;
        }

        for (const bucket of buckets) {
          results.push({
            range,
            weekday: bucket.id,
            name: bucket.name ?? "",
            total_seconds: bucket.total ?? 0,
            average_seconds: bucket.average ?? 0,
          });
        }

        this.logger.info(
          `Got ${buckets.length} weekday buckets for ${range}`
        );

        // Respect rate limits between range requests
        await this.sleep(200);
      } catch (error) {
        this.logger.error(`Failed to fetch weekday insights for range ${range}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }

    return results;
  }

  protected async transform(
    data: WeekdayWithRange[]
  ): Promise<WakaTimeWeekdayRecord[]> {
    return data.map((item) => ({
      range: item.range,
      weekday: item.weekday,
      name: item.name,
      total_seconds: Math.round(item.total_seconds),
      average_seconds: Math.round(item.average_seconds),
    }));
  }
}
