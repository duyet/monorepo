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

interface BestDayData {
  date: string;
  total_seconds: number;
}

interface BestDayInsightResponse {
  data?: BestDayData;
}

// Internal envelope carries the range alongside the API response
interface BestDayWithRange {
  range: InsightRange;
  date: string;
  total_seconds: number;
}

interface WakaTimeBestDayRecord {
  range: string;
  date: string;
  total_seconds: number;
}

export class WakaTimeInsightsBestDaySyncer extends BaseSyncer<
  BestDayWithRange,
  WakaTimeBestDayRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "wakatime-insights-best-day");
  }

  protected getTableName(): string {
    return "monorepo_wakatime_insights_best_day";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<BestDayWithRange[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    this.logger.info("Fetching WakaTime best-day insights for all ranges");

    const results: BestDayWithRange[] = [];

    for (const range of RANGES) {
      const url = `${WAKATIME_API_BASE_URL}/users/current/insights/best_day/${range}?api_key=${apiKey}`;

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

          return res.json() as Promise<BestDayInsightResponse>;
        });

        if (response?.data?.date) {
          results.push({
            range,
            date: response.data.date,
            total_seconds: response.data.total_seconds ?? 0,
          });
          this.logger.info(`Got best day for ${range}: ${response.data.date}`);
        } else {
          this.logger.warn(`No best day data returned for range ${range}`);
        }

        // Respect rate limits between range requests
        await this.sleep(200);
      } catch (error) {
        this.logger.error(`Failed to fetch best day for range ${range}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }

    return results;
  }

  protected async transform(
    data: BestDayWithRange[]
  ): Promise<WakaTimeBestDayRecord[]> {
    return data.map((item) => ({
      range: item.range,
      date: item.date,
      total_seconds: Math.round(item.total_seconds),
    }));
  }
}
