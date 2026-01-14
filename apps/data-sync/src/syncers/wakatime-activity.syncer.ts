import type { ClickHouseClient } from "@clickhouse/client";
import { wakatimeConfig } from "@duyet/config";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

/**
 * WakaTime Activity Syncer
 *
 * Syncs daily granular activity data from WakaTime insights endpoint.
 * This complements the WakaTimeSyncer which syncs aggregate stats.
 *
 * Data is stored in monorepo_wakatime_activity table for hybrid fetch:
 * - Historical data (>7 days) is read from ClickHouse
 * - Recent data (last 7 days) is fetched from API
 */

interface InsightsDayData {
  date: string;
  total: number;
}

interface InsightsResponse {
  data?: {
    days?: InsightsDayData[];
    is_up_to_date?: boolean;
  };
}

interface DurationItem {
  project: string;
  time: number;
  duration: number;
  ai_additions?: number;
  ai_deletions?: number;
  human_additions?: number;
  human_deletions?: number;
}

interface DurationsResponse {
  data?: DurationItem[];
}

interface WakaTimeActivityRecord {
  date: string;
  total_seconds: number;
  human_seconds: number;
  ai_seconds: number;
  has_ai_breakdown: number;
  source: string;
}

export class WakaTimeActivitySyncer extends BaseSyncer<
  InsightsDayData,
  WakaTimeActivityRecord
> {
  private apiKey: string | undefined;

  constructor(client: ClickHouseClient) {
    super(client, "wakatime-activity");
    this.apiKey = process.env.WAKATIME_API_KEY;
  }

  protected getTableName(): string {
    return "monorepo_wakatime_activity";
  }

  /**
   * Fetch daily activity data from WakaTime insights endpoint
   */
  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<InsightsDayData[]> {
    if (!this.apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    // Determine date range
    const endDate = options.endDate || new Date();
    const startDate =
      options.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Choose appropriate range for the API
    const range = this.determineRange(daysDiff);
    this.logger.info(`Fetching WakaTime activity for range: ${range}`);

    const endpoint = wakatimeConfig.endpoints.insights.days(range);
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${wakatimeConfig.baseUrl}${endpoint}${separator}api_key=${this.apiKey}`;

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url, {
          headers: { "User-Agent": "data-sync-app" },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("WakaTime API authentication failed");
          }
          if (res.status === 429) {
            throw new Error("WakaTime API rate limit exceeded");
          }
          throw new Error(`WakaTime API error: ${res.status}`);
        }

        return res.json();
      });

      const data: InsightsResponse = response;

      if (!data?.data?.days || !Array.isArray(data.data.days)) {
        this.logger.warn("No days data from WakaTime insights");
        return [];
      }

      // Filter by date range and dataStartYear
      const startYear = wakatimeConfig.dataStartYear;
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);

      const filteredDays = data.data.days.filter((day) => {
        if (!day.date || day.total == null) return false;
        const date = new Date(day.date);
        if (date.getFullYear() < startYear) return false;
        if (day.date < startDateStr || day.date > endDateStr) return false;
        return true;
      });

      this.logger.info(`Retrieved ${filteredDays.length} days from insights`);
      return filteredDays;
    } catch (error) {
      this.logger.error("Failed to fetch WakaTime activity", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Transform insights data to activity records
   * Attempts to fetch AI breakdown from durations endpoint for recent dates
   */
  protected async transform(
    data: InsightsDayData[]
  ): Promise<WakaTimeActivityRecord[]> {
    const records: WakaTimeActivityRecord[] = [];

    // Try to get AI breakdown for recent dates (last 7 days)
    const recentDates = data
      .filter((d) => this.isRecentDate(d.date, 7))
      .map((d) => d.date);

    const aiBreakdownMap = await this.fetchAIBreakdown(recentDates);

    for (const day of data) {
      const aiData = aiBreakdownMap.get(day.date);

      if (aiData) {
        // Use actual AI breakdown
        records.push({
          date: day.date,
          total_seconds: Math.round(day.total),
          human_seconds: Math.round(aiData.humanSeconds),
          ai_seconds: Math.round(aiData.aiSeconds),
          has_ai_breakdown: 1,
          source: "insights",
        });
      } else {
        // Estimate 80/20 split when no AI data available
        records.push({
          date: day.date,
          total_seconds: Math.round(day.total),
          human_seconds: Math.round(day.total * 0.8),
          ai_seconds: Math.round(day.total * 0.2),
          has_ai_breakdown: 0,
          source: "insights",
        });
      }
    }

    return records;
  }

  /**
   * Fetch AI breakdown from durations endpoint (premium feature)
   */
  private async fetchAIBreakdown(
    dates: string[]
  ): Promise<Map<string, { humanSeconds: number; aiSeconds: number }>> {
    const result = new Map<
      string,
      { humanSeconds: number; aiSeconds: number }
    >();

    if (!this.apiKey || dates.length === 0) return result;

    let consecutiveErrors = 0;
    const MAX_ERRORS = 3;

    for (const date of dates) {
      const endpoint = wakatimeConfig.endpoints.durations(date);
      const url = `${wakatimeConfig.baseUrl}${endpoint}&api_key=${this.apiKey}`;

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "data-sync-app" },
        });

        if (!res.ok) {
          // Premium feature - gracefully skip
          if (res.status === 402 || res.status === 401 || res.status === 403) {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_ERRORS) {
              this.logger.info("Durations endpoint requires premium, skipping");
              break;
            }
            continue;
          }
          continue;
        }

        consecutiveErrors = 0;
        const data: DurationsResponse = await res.json();

        if (data?.data && Array.isArray(data.data)) {
          let humanSeconds = 0;
          let aiSeconds = 0;

          for (const duration of data.data) {
            if (!duration.duration) continue;

            const humanActivity =
              (duration.human_additions || 0) + (duration.human_deletions || 0);
            const aiActivity =
              (duration.ai_additions || 0) + (duration.ai_deletions || 0);
            const totalActivity = humanActivity + aiActivity;

            if (totalActivity > 0) {
              humanSeconds +=
                duration.duration * (humanActivity / totalActivity);
              aiSeconds += duration.duration * (aiActivity / totalActivity);
            } else {
              humanSeconds += duration.duration * 0.8;
              aiSeconds += duration.duration * 0.2;
            }
          }

          if (humanSeconds > 0 || aiSeconds > 0) {
            result.set(date, { humanSeconds, aiSeconds });
          }
        }

        // Rate limiting
        await this.sleep(100);
      } catch {
        // Silently skip errors for AI breakdown
      }
    }

    this.logger.info(
      `Got AI breakdown for ${result.size}/${dates.length} days`
    );
    return result;
  }

  /**
   * Check if a date is within the last N days
   */
  private isRecentDate(dateStr: string, days: number): boolean {
    const date = new Date(dateStr);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return date >= cutoff;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Determine WakaTime range based on days
   */
  private determineRange(days: number): string {
    if (days <= 7) return wakatimeConfig.ranges.last_7_days;
    if (days <= 30) return wakatimeConfig.ranges.last_30_days;
    if (days <= 180) return wakatimeConfig.ranges.last_6_months;
    if (days <= 365) return wakatimeConfig.ranges.last_year;
    return wakatimeConfig.ranges.all_time;
  }
}
