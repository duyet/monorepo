import type { ClickHouseClient } from "@clickhouse/client";
import { request } from "graphql-request";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface CloudflareHttpRequest {
  date: {
    date: string;
  };
  sum: {
    requests: number;
    pageViews: number;
    cachedBytes: number;
    bytes: number;
  };
  uniq: {
    uniques: number;
  };
}

interface CloudflareAnalyticsResponse {
  viewer: {
    zones: Array<{
      httpRequests1dGroups: CloudflareHttpRequest[];
    }>;
  };
}

interface CloudflareDailyRecord {
  date: string;
  requests: number;
  page_views: number;
  unique_visitors: number;
  cached_bytes: number;
  total_bytes: number;
  cache_ratio: number;
  raw_response: string;
}

export class CloudflareSyncer extends BaseSyncer<
  CloudflareAnalyticsResponse,
  CloudflareDailyRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "cloudflare");
  }

  protected getTableName(): string {
    return "monorepo_cloudflare";
  }

  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<CloudflareAnalyticsResponse[]> {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiKey = process.env.CLOUDFLARE_API_KEY;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // Support both auth methods: API_KEY (local dev) or API_TOKEN (production)
    const authToken = apiToken || apiKey;
    if (!zoneId || !authToken) {
      throw new Error(
        "CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_KEY or CLOUDFLARE_API_TOKEN environment variables are required"
      );
    }

    const { startDate, endDate } = this.determineDateRange(options);
    this.logger.info(
      `Fetching Cloudflare analytics from ${startDate} to ${endDate}`
    );

    // Chunked rolling: split date range into smaller chunks to avoid rate limits
    const chunks = this.getDateChunks(startDate, endDate);
    this.logger.info(`Fetching data in ${chunks.length} chunks`);

    const query = `
      query viewer($zoneTag: string, $date_start: string, $date_end: string) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequests1dGroups(
              orderBy: [date_ASC]
              limit: 1000
              filter: { date_geq: $date_start, date_lt: $date_end }
            ) {
              date: dimensions {
                date
              }
              sum {
                requests
                pageViews
                cachedBytes
                bytes
              }
              uniq {
                uniques
              }
            }
          }
        }
      }
    `;

    const allResponses: CloudflareAnalyticsResponse[] = [];

    // Fetch each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      this.logger.info(
        `Fetching chunk ${i + 1}/${chunks.length}: ${chunk.start} to ${chunk.end}`
      );

      const variables = {
        zoneTag: zoneId,
        date_start: chunk.start,
        date_end: chunk.end,
      };

      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      try {
        const response = await this.withRetry(async () => {
          const data = await request<CloudflareAnalyticsResponse>(
            "https://api.cloudflare.com/client/v4/graphql",
            query,
            variables,
            headers
          );

          if (!data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
            throw new Error("Cloudflare API returned invalid response format");
          }

          return data;
        });

        allResponses.push(response);

        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await this.sleep(500); // 500ms delay
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch chunk ${i + 1}/${chunks.length}: ${chunk.start} to ${chunk.end}`,
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }
    }

    this.logger.info(
      `Successfully fetched ${allResponses.length} of ${chunks.length} chunks`
    );

    return allResponses;
  }

  protected async transform(
    data: CloudflareAnalyticsResponse[]
  ): Promise<CloudflareDailyRecord[]> {
    const records: CloudflareDailyRecord[] = [];

    for (const response of data) {
      const zone = response.viewer.zones[0];
      if (!zone || !zone.httpRequests1dGroups) {
        continue;
      }

      for (const httpRequest of zone.httpRequests1dGroups) {
        const totalBytes = httpRequest.sum.bytes || 0;
        const cachedBytes = httpRequest.sum.cachedBytes || 0;
        const cacheRatio =
          totalBytes > 0 ? (cachedBytes / totalBytes) * 100 : 0;

        records.push({
          date: httpRequest.date.date,
          requests: httpRequest.sum.requests || 0,
          page_views: httpRequest.sum.pageViews || 0,
          unique_visitors: httpRequest.uniq.uniques || 0,
          cached_bytes: cachedBytes,
          total_bytes: totalBytes,
          cache_ratio: Math.round(cacheRatio * 100) / 100,
          raw_response: JSON.stringify(httpRequest),
        });
      }
    }

    return records;
  }

  private determineDateRange(options: SyncOptions): {
    startDate: string;
    endDate: string;
  } {
    const endDate = options.endDate || new Date();
    const startDate =
      options.startDate ||
      new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }

  /**
   * Split date range into chunks to avoid rate limits
   * Uses 7-day chunks for daily sync pattern
   */
  private getDateChunks(startDate: string, endDate: string): Array<{
    start: string;
    end: string;
  }> {
    const chunks: Array<{ start: string; end: string }> = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Use 7-day chunks (daily sync -> rolling last 7 days)
    const chunkDays = 7;
    const chunkMs = chunkDays * 24 * 60 * 60 * 1000;

    let currentStart = new Date(start);
    while (currentStart < end) {
      let currentEnd = new Date(currentStart.getTime() + chunkMs);
      if (currentEnd > end) {
        currentEnd = end;
      }

      chunks.push({
        start: currentStart.toISOString().split("T")[0],
        end: currentEnd.toISOString().split("T")[0],
      });

      currentStart = currentEnd;
    }

    return chunks;
  }
}
