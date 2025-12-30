import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface PostHogBreakdownResponse {
  next: string | null;
  results: PostHogBreakdownResult[];
}

interface PostHogBreakdownResult {
  breakdown_value: string;
  visitors: number;
  views: number;
  sessions: number;
}

interface PostHogPathRecord {
  date: string;
  path: string;
  visitors: number;
  views: number;
  sessions: number;
}

const POSTHOG_API_URL = "https://app.posthog.com";

export class PostHogSyncer extends BaseSyncer<
  PostHogBreakdownResponse,
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
  ): Promise<PostHogBreakdownResponse> {
    const { startDate, endDate } = this.determineDateRange(options);
    const url = new URL(
      `${POSTHOG_API_URL}/api/projects/${this.projectId}/web_analytics/breakdown/`
    );

    // Query parameters
    url.searchParams.set("breakdown_by", "Page");
    url.searchParams.set("date_from", startDate);
    url.searchParams.set("date_to", endDate);
    url.searchParams.set("limit", "1000");
    url.searchParams.set("apply_path_cleaning", "true");

    this.logger.info(
      `Fetching PostHog analytics from ${startDate} to ${endDate}`
    );

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
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
          const errorText = await res.text().catch(() => res.statusText);
          throw new Error(
            `PostHog API error: ${res.status} ${errorText}`
          );
        }

        return res.json() as Promise<PostHogBreakdownResponse>;
      });

      return response;
    } catch (error) {
      this.logger.error("Failed to fetch from PostHog API", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: PostHogBreakdownResponse
  ): Promise<PostHogPathRecord[]> {
    const records: PostHogPathRecord[] = [];
    const snapshotDate = new Date().toISOString().split("T")[0];

    if (!data.results || data.results.length === 0) {
      this.logger.warn("No results in PostHog response");
      return records;
    }

    for (const result of data.results) {
      const path = result.breakdown_value;

      // Skip empty paths
      if (!path || path === "") {
        continue;
      }

      records.push({
        date: snapshotDate,
        path,
        visitors: result.visitors || 0,
        views: result.views || 0,
        sessions: result.sessions || 0,
      });
    }

    this.logger.info(`Transformed ${records.length} path records`);
    return records;
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
