import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface PostHogEvent {
  uuid: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  distinct_id: string;
}

interface PostHogEventsResponse {
  next: string | null;
  results: PostHogEvent[];
}

interface PostHogPathRecord {
  date: string;
  path: string;
  visitors: number;
  views: number;
  sessions: number;
}

interface AggregatedPathData {
  visitors: Set<string>;
  views: number;
  sessions: Set<string>;
}

const POSTHOG_API_URL = "https://app.posthog.com";

export class PostHogSyncer extends BaseSyncer<
  PostHogEventsResponse,
  PostHogPathRecord
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
  ): Promise<PostHogEventsResponse[]> {
    const { startDate, endDate } = this.determineDateRange(options);
    const allEvents: PostHogEvent[] = [];

    // Start with initial URL
    let url: URL | null = new URL(
      `${POSTHOG_API_URL}/api/projects/${this.projectId}/events/`
    );

    // Query parameters for pageview events
    url.searchParams.set("event", "$pageview");
    url.searchParams.set("after", startDate);
    url.searchParams.set("before", endDate);
    url.searchParams.set("limit", "100"); // Max per page

    this.logger.info(
      `Fetching PostHog pageview events from ${startDate} to ${endDate}`
    );

    try {
      // Fetch all pages of events
      let pageCount = 0;
      const maxPages = 50; // Safety limit: 50 pages = 5000 events

      while (url && pageCount < maxPages) {
        pageCount++;

        const response = await this.withRetry(async () => {
          const res = await fetch(url!.toString(), {
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
              throw new Error(`PostHog project not found: ${this.projectId}`);
            }
            const errorText = await res.text().catch(() => res.statusText);
            throw new Error(`PostHog API error: ${res.status} ${errorText}`);
          }

          return res.json() as Promise<PostHogEventsResponse>;
        });

        allEvents.push(...response.results);

        // Check for next page
        url = response.next ? new URL(response.next) : null;

        this.logger.info(
          `Fetched page ${pageCount}: ${response.results.length} events`
        );
      }

      if (pageCount >= maxPages) {
        this.logger.warn(
          `Reached maximum page limit (${maxPages}), some events may be missing`
        );
      }

      this.logger.info(
        `Total events fetched: ${allEvents.length} across ${pageCount} pages`
      );

      return [{ results: allEvents, next: null }];
    } catch (error) {
      this.logger.error("Failed to fetch from PostHog API", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: PostHogEventsResponse[]
  ): Promise<PostHogPathRecord[]> {
    const records: PostHogPathRecord[] = [];

    if (!data || data.length === 0) {
      this.logger.warn("No events in PostHog response");
      return records;
    }

    // Aggregate events by date and path
    const pathMap = new Map<string, AggregatedPathData>();

    for (const response of data) {
      for (const event of response.results) {
      if (event.event !== "$pageview") {
        continue;
      }

      // Extract path from $current_url property
      const currentUrl = event.properties.$current_url as string | undefined;
      if (!currentUrl) {
        continue;
      }

      // Parse URL to get pathname
      let path: string;
      try {
        const urlObj = new URL(currentUrl);
        path = urlObj.pathname;
      } catch {
        // If URL parsing fails, use the value as-is
        path = currentUrl;
      }

      // Skip empty paths
      if (!path || path === "" || path === "/") {
        path = "/";
      }

      // Extract date from timestamp
      const eventDate = event.timestamp.split("T")[0];

      // Create key for aggregation
      const key = `${eventDate}:${path}`;

      if (!pathMap.has(key)) {
        pathMap.set(key, {
          visitors: new Set<string>(),
          views: 0,
          sessions: new Set<string>(),
        });
      }

      const aggregated = pathMap.get(key)!;
      aggregated.visitors.add(event.distinct_id);
      aggregated.views++;

      // Use distinct_id as a simple session identifier
      // For more accurate session tracking, you'd use $session_id
      const sessionId =
        (event.properties.$session_id as string | undefined) ||
        event.distinct_id;
      aggregated.sessions.add(sessionId);
      }
    }

    // Convert aggregated data to records
    for (const [key, data] of pathMap.entries()) {
      const [date, path] = key.split(":");

      records.push({
        date,
        path,
        visitors: data.visitors.size,
        views: data.views,
        sessions: data.sessions.size,
      });
    }

    this.logger.info(
      `Transformed ${records.length} path records from ${data.reduce((sum, d) => sum + d.results.length, 0)} events`
    );
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

    // PostHog Events API has recommended date range limits
    const maxDaysPerRequest = 7; // Use 7 days to avoid timeouts
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    let actualStartDate = startDate;
    if (daysDiff > maxDaysPerRequest) {
      this.logger.warn(
        `Requested ${daysDiff} days but limiting to ${maxDaysPerRequest} days for Events API`
      );
      actualStartDate = new Date(
        endDate.getTime() - maxDaysPerRequest * 24 * 60 * 60 * 1000
      );
    }

    // Convert to ISO format for Events API (needs full timestamp)
    return {
      startDate: actualStartDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }
}
