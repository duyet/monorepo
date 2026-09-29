import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";
import {
  fetchWakaTimeJson,
  WAKA_TIME_INSIGHT_RANGES,
  type WakaTimeInsightRange,
  WAKA_TIME_INSIGHTS_STYLE,
  wakaTimeApiUrl,
} from "../lib/wakatime";

interface WeekdayBucket {
  id: number; // 0-6 (Sunday-Saturday per WakaTime)
  name: string; // e.g. "Sunday"
  total: number;
  average: number;
  percent?: number;
}

interface WeekdayInsightResponse {
  data?: WeekdayBucket[];
}

// Internal envelope carries the range alongside individual buckets
interface WeekdayWithRange {
  range: WakaTimeInsightRange;
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

    for (const range of WAKA_TIME_INSIGHT_RANGES) {
      const url = wakaTimeApiUrl(
        `/users/current/insights/weekday/${range}`,
        apiKey
      );

      try {
        const response = await this.withRetry(() =>
          fetchWakaTimeJson<WeekdayInsightResponse>(
            url,
            WAKA_TIME_INSIGHTS_STYLE
          )
        );

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

        this.logger.info(`Got ${buckets.length} weekday buckets for ${range}`);

        // Respect rate limits between range requests
        await this.sleep(200);
      } catch (error) {
        this.logger.error(
          `Failed to fetch weekday insights for range ${range}`,
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );
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
