import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

const WAKATIME_API_BASE_URL = "https://wakatime.com/api/v1";

interface WakaTimeProjectUrls {
  main?: string;
  wakatime_dashboard?: string;
  [key: string]: string | undefined;
}

interface WakaTimeProjectItem {
  id: string;
  name: string;
  repository?: string | null;
  last_heartbeat_at?: string | null;
  has_public_url?: boolean;
  url?: string;
  wakatime_dashboard_url?: string;
  urls?: WakaTimeProjectUrls;
  languages?: string[];
  created_at?: string | null;
}

interface WakaTimeProjectsResponse {
  data: WakaTimeProjectItem[];
}

interface WakaTimeProjectRecord {
  project_id: string;
  name: string;
  repository: string;
  last_heartbeat_at: string;
  has_public_url: number;
  urls: string;
  languages: string;
  created_at: string;
}

export class WakaTimeProjectsSyncer extends BaseSyncer<
  WakaTimeProjectItem,
  WakaTimeProjectRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "wakatime-projects");
  }

  protected getTableName(): string {
    return "monorepo_wakatime_projects";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<WakaTimeProjectItem[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    const url = `${WAKATIME_API_BASE_URL}/users/current/projects?api_key=${apiKey}`;

    this.logger.info("Fetching WakaTime projects");

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url, {
          headers: { "User-Agent": "data-sync-app" },
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

        const data: WakaTimeProjectsResponse = await res.json();

        if (!data || !Array.isArray(data.data)) {
          throw new Error(
            "WakaTime projects API returned invalid response format"
          );
        }

        return data;
      });

      this.logger.info(`Retrieved ${response.data.length} projects`);
      return response.data;
    } catch (error) {
      this.logger.error("Failed to fetch WakaTime projects", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: WakaTimeProjectItem[]
  ): Promise<WakaTimeProjectRecord[]> {
    const fallbackTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    return data.map((project) => {
      // Normalise urls: prefer the dedicated urls object, fall back to top-level fields
      const urlsObj: WakaTimeProjectUrls = project.urls ?? {};
      if (!urlsObj.main && project.url) urlsObj.main = project.url;
      if (!urlsObj.wakatime_dashboard && project.wakatime_dashboard_url)
        urlsObj.wakatime_dashboard = project.wakatime_dashboard_url;

      return {
        project_id: project.id,
        name: project.name ?? "",
        repository: project.repository ?? "",
        last_heartbeat_at: project.last_heartbeat_at
          ? project.last_heartbeat_at.slice(0, 19).replace("T", " ")
          : fallbackTimestamp,
        has_public_url: project.has_public_url ? 1 : 0,
        urls: JSON.stringify(urlsObj),
        languages: JSON.stringify(project.languages ?? []),
        created_at: project.created_at
          ? project.created_at.slice(0, 19).replace("T", " ")
          : fallbackTimestamp,
      };
    });
  }
}
