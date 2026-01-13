import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface WakaTimeCategory {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeLanguage {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeEditor {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeProject {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeOS {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeMachine {
  name: string;
  total_seconds: number;
  percent: number;
}

interface WakaTimeStatsResponse {
  data: {
    id: string;
    user_id: string;
    total_seconds: number;
    daily_average: number;
    // Range is a string identifier like "last_7_days", not an object
    range: string;
    // Start and end are top-level in data, not nested under range
    start: string;
    end: string;
    timeout: number;
    writes_only: boolean;
    timezone: string;
    holidays: number;
    status: string;
    categories: WakaTimeCategory[];
    languages: WakaTimeLanguage[];
    editors: WakaTimeEditor[];
    projects: WakaTimeProject[];
    operating_systems: WakaTimeOS[];
    machines: WakaTimeMachine[];
    days_including_holidays?: number;
    days_minus_holidays?: number;
    best_day?: {
      date: string;
      total_seconds: number;
    };
  };
}

interface WakaTimeDailyRecord {
  date: string;
  total_seconds: number;
  daily_average: number;
  days_active: number;
  categories: string;
  languages: string;
  editors: string;
  projects: string;
  operating_systems: string;
  machines: string;
  best_day_date: string | null;
  best_day_seconds: number | null;
  raw_response: string;
}

export class WakaTimeSyncer extends BaseSyncer<
  WakaTimeStatsResponse,
  WakaTimeDailyRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "wakatime");
  }

  protected getTableName(): string {
    return "monorepo_wakatime";
  }

  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<WakaTimeStatsResponse[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    const range = this.determineRange(options);
    this.logger.info(`Fetching WakaTime stats for range: ${range}`);

    const endpoint = wakatimeConfig.endpoints.stats(range);
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${wakatimeConfig.baseUrl}${endpoint}${separator}api_key=${apiKey}`;

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "data-sync-app",
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error(
              "WakaTime API authentication failed: Invalid or expired API key"
            );
          }
          if (res.status === 403) {
            throw new Error(
              "WakaTime API access forbidden - check permissions"
            );
          }
          if (res.status === 429) {
            throw new Error("WakaTime API rate limit exceeded");
          }
          throw new Error(
            `WakaTime API error: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();

        if (!data || typeof data !== "object" || !data.data) {
          throw new Error("WakaTime API returned invalid response format");
        }

        return data;
      });

      return [response];
    } catch (error) {
      this.logger.error("Failed to fetch from WakaTime API", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: WakaTimeStatsResponse[]
  ): Promise<WakaTimeDailyRecord[]> {
    return data.map((response) => {
      const { data: statsData } = response;

      // Use end date as the record date (end is top-level in data, not nested under range)
      const date = statsData.end.split("T")[0];

      return {
        date,
        // Round floats to integers for ClickHouse UInt64 columns
        total_seconds: Math.round(statsData.total_seconds || 0),
        daily_average: Math.round(statsData.daily_average || 0),
        days_active:
          statsData.days_minus_holidays ||
          statsData.days_including_holidays ||
          0,
        categories: JSON.stringify(statsData.categories || []),
        languages: JSON.stringify(statsData.languages || []),
        editors: JSON.stringify(statsData.editors || []),
        projects: JSON.stringify(statsData.projects || []),
        operating_systems: JSON.stringify(statsData.operating_systems || []),
        machines: JSON.stringify(statsData.machines || []),
        best_day_date: statsData.best_day?.date || null,
        best_day_seconds: statsData.best_day?.total_seconds
          ? Math.round(statsData.best_day.total_seconds)
          : null,
        raw_response: JSON.stringify(response),
      };
    });
  }

  private determineRange(options: SyncOptions): string {
    // If date range specified, use appropriate range
    if (options.startDate || options.endDate) {
      const now = new Date();
      const start =
        options.startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const daysDiff = Math.floor(
        (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysDiff <= 7) return wakatimeConfig.ranges.last_7_days;
      if (daysDiff <= 30) return wakatimeConfig.ranges.last_30_days;
      if (daysDiff <= 180) return wakatimeConfig.ranges.last_6_months;
      if (daysDiff <= 365) return wakatimeConfig.ranges.last_year;
      return wakatimeConfig.ranges.all_time;
    }

    // Default to last 7 days for frequent syncing
    return wakatimeConfig.ranges.last_7_days;
  }
}
