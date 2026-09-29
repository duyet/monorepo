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

interface BestDayData {
  date: string;
  total_seconds: number;
}

interface BestDayInsightResponse {
  data?: BestDayData;
}

// Internal envelope carries the range alongside the API response
interface BestDayWithRange {
  range: WakaTimeInsightRange;
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

    for (const range of WAKA_TIME_INSIGHT_RANGES) {
      const url = wakaTimeApiUrl(
        `/users/current/insights/best_day/${range}`,
        apiKey
      );

      try {
        const response = await this.withRetry(() =>
          fetchWakaTimeJson<BestDayInsightResponse>(
            url,
            WAKA_TIME_INSIGHTS_STYLE
          )
        );

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
