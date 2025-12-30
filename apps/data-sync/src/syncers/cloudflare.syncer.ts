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

    if (!zoneId || !apiKey) {
      throw new Error(
        "CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_KEY environment variables are required"
      );
    }

    const { startDate, endDate } = this.determineDateRange(options);
    this.logger.info(
      `Fetching Cloudflare analytics from ${startDate} to ${endDate}`
    );

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

    const variables = {
      zoneTag: zoneId,
      date_start: startDate,
      date_end: endDate,
    };

    const headers = {
      Authorization: `Bearer ${apiKey}`,
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

      return [response];
    } catch (error) {
      this.logger.error("Failed to fetch from Cloudflare API", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
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

    // Cloudflare free tier has a 365-day limit
    const maxDaysPerRequest = 364;
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    let actualStartDate = startDate;
    if (daysDiff > maxDaysPerRequest) {
      this.logger.warn(
        `Requested ${daysDiff} days but limiting to ${maxDaysPerRequest} days due to Cloudflare quota limits`
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
