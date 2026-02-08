import type { CloudflareAnalyticsByDate } from "@duyet/interfaces";
import { request } from "graphql-request";
import { type PeriodData, TIME_PERIODS } from "@/types/periods";
import { CloudflareClient } from "./cloudflare-client";

export interface CloudflareDataByPeriod {
  data: CloudflareAnalyticsByDate;
  totalRequests: number;
  totalPageviews: number;
  generatedAt: string;
}

export async function CloudflareWithPeriods() {
  const allPeriodData = await getDataForAllPeriods();

  return <CloudflareClient data={allPeriodData} />;
}

const getDataForAllPeriods = async (): Promise<
  PeriodData<CloudflareDataByPeriod>
> => {
  const results: Partial<PeriodData<CloudflareDataByPeriod>> = {};
  const generatedAt = new Date().toISOString();

  // Fetch data for each time period
  for (const period of TIME_PERIODS) {
    try {
      const periodData = await getDataForPeriod(period.days);
      results[period.value] = {
        ...periodData,
        generatedAt,
      };
    } catch (error) {
      console.error(
        `Error fetching Cloudflare data for ${period.value}:`,
        error
      );
      // Fallback to empty data structure
      results[period.value] = {
        data: {
          viewer: {
            zones: [
              {
                httpRequests1dGroups: [],
              },
            ],
          },
        },
        totalRequests: 0,
        totalPageviews: 0,
        generatedAt,
      };
    }
  }

  return {
    ...results,
    generatedAt,
  } as PeriodData<CloudflareDataByPeriod>;
};

const getDataForPeriod = async (days: number) => {
  // Check if required environment variables are present
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  // Support both auth methods: API_KEY (local dev) or API_TOKEN (production)
  const authToken = apiToken || apiKey;
  if (!zoneId || !authToken) {
    // Return empty data for SSG builds without credentials
    console.warn(
      "[Cloudflare] API credentials not configured - returning empty data for SSG build"
    );
    return {
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [],
            },
          ],
        },
      },
      totalRequests: 0,
      totalPageviews: 0,
    };
  }

  // Cloudflare free tier only allows max 364 days of data (31536000s limit)
  // Using 364 to stay safely within the 365-day quota
  const maxDays = 364;
  const actualDays = Math.min(days, maxDays);

  if (days > maxDays) {
    console.warn(
      `Requested ${days} days but limiting to ${maxDays} days due to Cloudflare quota limits`
    );
  }

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
    }`;

  const variables = {
    zoneTag: zoneId,
    date_start: new Date(new Date().setDate(new Date().getDate() - actualDays))
      .toISOString()
      .split("T")[0],
    date_end: new Date().toISOString().split("T")[0],
  };

  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  let data: CloudflareAnalyticsByDate;
  try {
    data = await request(
      "https://api.cloudflare.com/client/v4/graphql",
      query,
      variables,
      headers
    );
  } catch (error) {
    console.error("[Cloudflare] GraphQL request failed:", error instanceof Error ? error.message : String(error));
    return {
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [],
            },
          ],
        },
      },
      totalRequests: 0,
      totalPageviews: 0,
    };
  }

  const zone = data.viewer.zones[0];

  if (!zone || !zone.httpRequests1dGroups) {
    console.error("No zone data returned from Cloudflare API");
    // Return empty data instead of throwing to avoid SSG serialization issues
    return {
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [],
            },
          ],
        },
      },
      totalRequests: 0,
      totalPageviews: 0,
    };
  }

  const totalRequests = zone.httpRequests1dGroups.reduce(
    (total, i) => total + i.sum.requests,
    0
  );

  const totalPageviews = zone.httpRequests1dGroups.reduce(
    (total, i) => total + i.sum.pageViews,
    0
  );

  return {
    data,
    totalRequests,
    totalPageviews,
  };
};
