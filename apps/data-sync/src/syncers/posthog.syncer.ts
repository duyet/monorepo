import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface PostHogResponse {
  cache_key: string;
  is_cached: boolean;
  columns: string[];
  error: string | null;
  hasMore: boolean;
  results: (string | number)[][];
}

interface PostHogQuery {
  kind: string;
  properties: unknown[];
  breakdownBy: string;
  dateRange: {
    date_from: string;
    date_to: string | null;
  };
  includeScrollDepth: boolean;
  includeBounceRate: boolean;
  doPathCleaning: boolean;
  limit: number;
  useSessionsTable: boolean;
}

interface PostHogPathRecord {
  date: string;
  path: string;
  visitors: number;
  views: number;
  bounce_rate: number | null;
}

interface PostHogDailySummary {
  date: string;
  total_visitors: number;
  total_views: number;
  unique_paths: number;
}

const POSTHOG_API_URL = "https://app.posthog.com";

export class PostHogSyncer extends BaseSyncer<
  PostHogResponse[],
  PostHogPathRecord[]
> {
  private apiKey: string;
  private projectId: string;

  constructor(client: ClickHouseClient) {
    super(client, "posthog");
    this.apiKey = process.env.POSTHOG_API_KEY || "";
    this.projectId = process.env.POSTHOG_PROJECT_ID || "";

    if (!this.apiKey || !this.projectId) {
      throw new Error(
        "POSTHOG_API_KEY and POSTHOG_PROJECT_ID environment variables are required"
      );
    }
  }

  protected getTableName(): string {
    return "monorepo_posthog";
  }

  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<PostHogResponse[]> {
    const { startDate, endDate } = this.determineDateRange(options);
    const apiUrl = `${POSTHOG_API_URL}/api/projects/${this.projectId}/query/`;

    this.logger.info(
      `Fetching PostHog analytics from ${startDate} to ${endDate}`
    );

    const query: PostHogQuery = {
      kind: "WebStatsTableQuery",
      properties: [],
      breakdownBy: "Page",
      dateRange: {
        date_from: startDate,
        date_to: endDate,
      },
      includeScrollDepth: false,
      includeBounceRate: true,
      doPathCleaning: false,
      limit: 1000,
      useSessionsTable: true,
    };

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(query),
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error(
              "PostHog API authentication failed: Invalid API key"
            );
          }
          if (res.status === 404) {
            throw new Error(
              `PostHog project not found: ${this.projectId}`
            );
          }
          throw new Error(
            `PostHog API error: ${res.status} ${res.statusText}`
          );
        }

        return res.json() as Promise<PostHogResponse>;
      });

      // Wrap single response in array
      return [response as PostHogResponse];
    } catch (error) {
      this.logger.error("Failed to fetch from PostHog API", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: PostHogResponse[]
  ): Promise<PostHogPathRecord[]> {
    const records: PostHogPathRecord[] = [];
    const snapshotDate = new Date().toISOString().split("T")[0];

    for (const response of data) {
      if (!response.results || response.results.length === 0) {
        this.logger.warn("No results in PostHog response");
        continue;
      }

      if (response.error) {
        this.logger.error(`PostHog API error: ${response.error}`);
        continue;
      }

      // Find column indices
      const pathIndex = response.columns.findIndex(
        (col) =>
          col.toLowerCase().includes("page") ||
          col.toLowerCase().includes("path") ||
          col.toLowerCase().includes("breakdown_value")
      );
      const visitorsIndex = response.columns.findIndex(
        (col) =>
          col.toLowerCase().includes("visitor") ||
          col.toLowerCase().includes("unique")
      );
      const viewsIndex = response.columns.findIndex(
        (col) =>
          col.toLowerCase().includes("view") ||
          col.toLowerCase().includes("pageview")
      );
      const bounceIndex = response.columns.findIndex((col) =>
        col.toLowerCase().includes("bounce")
      );

      if (pathIndex === -1 || visitorsIndex === -1 || viewsIndex === -1) {
        this.logger.warn("PostHog columns not found as expected", {
          columns: response.columns,
          pathIndex,
          visitorsIndex,
          viewsIndex,
        });
        continue;
      }

      for (const result of response.results) {
        const pathValue = result[pathIndex] as string;
        const visitorsData = result[visitorsIndex];
        const viewsData = result[viewsIndex];
        const bounceData = bounceIndex !== -1 ? result[bounceIndex] : null;

        // Handle array format [count, comparison] or simple number
        const visitors = Array.isArray(visitorsData)
          ? Number(visitorsData[0]) || 0
          : Number(visitorsData) || 0;
        const views = Array.isArray(viewsData)
          ? Number(viewsData[0]) || 0
          : Number(viewsData) || 0;
        const bounceRate = bounceData
          ? Array.isArray(bounceData)
            ? Number(bounceData[0]) || null
            : Number(bounceData) || null
          : null;

        // Skip empty paths
        if (!pathValue || pathValue === "") {
          continue;
        }

        records.push({
          date: snapshotDate,
          path: pathValue,
          visitors,
          views,
          bounce_rate: bounceRate,
        });
      }
    }

    this.logger.info(`Transformed ${records.length} path records`);
    return records;
  }

  /**
   * Calculate daily summaries from path records
   */
  async getDailySummaries(
    records: PostHogPathRecord[]
  ): Promise<PostHogDailySummary[]> {
    const summariesByDate = new Map<string, PostHogDailySummary>();

    for (const record of records) {
      const existing = summariesByDate.get(record.date);

      if (existing) {
        existing.total_visitors += record.visitors;
        existing.total_views += record.views;
        existing.unique_paths += 1;
      } else {
        summariesByDate.set(record.date, {
          date: record.date,
          total_visitors: record.visitors,
          total_views: record.views,
          unique_paths: 1,
        });
      }
    }

    return Array.from(summariesByDate.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }

  private determineDateRange(options: SyncOptions): {
    startDate: string;
    endDate: string;
  } {
    const endDate = options.endDate || new Date();
    const startDate =
      options.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // PostHog has limits on date range
    const maxDaysPerRequest = 365;
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    let actualStartDate = startDate;
    if (daysDiff > maxDaysPerRequest) {
      this.logger.warn(
        `Requested ${daysDiff} days but limiting to ${maxDaysPerRequest} days due to PostHog limits`
      );
      actualStartDate = new Date(
        endDate.getTime() - maxDaysPerRequest * 24 * 60 * 60 * 1000
      );
    }

    return {
      startDate: actualStartDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }
}
