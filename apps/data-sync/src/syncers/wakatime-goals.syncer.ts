import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

const WAKATIME_API_BASE_URL = "https://wakatime.com/api/v1";

interface WakaTimeGoal {
  id: string;
  title: string;
  custom_title?: string;
  type: string;
  seconds: number;
  status: string;
  average_status: string;
  range_text: string;
  snoozed?: boolean;
  modified_at: string;
}

interface WakaTimeGoalsResponse {
  data: WakaTimeGoal[];
}

interface WakaTimeGoalRecord {
  goal_id: string;
  title: string;
  custom_title: string;
  type: string;
  seconds: number;
  status: string;
  average_status: string;
  range_text: string;
  snoozed: number;
  modified_at: string;
}

export class WakaTimeGoalsSyncer extends BaseSyncer<
  WakaTimeGoal,
  WakaTimeGoalRecord
> {
  constructor(client: ClickHouseClient) {
    super(client, "wakatime-goals");
  }

  protected getTableName(): string {
    return "monorepo_wakatime_goals";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<WakaTimeGoal[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    const url = `${WAKATIME_API_BASE_URL}/users/current/goals?api_key=${apiKey}`;

    this.logger.info("Fetching WakaTime goals");

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

        const data: WakaTimeGoalsResponse = await res.json();

        if (!data || !Array.isArray(data.data)) {
          throw new Error("WakaTime goals API returned invalid response format");
        }

        return data;
      });

      this.logger.info(`Retrieved ${response.data.length} goals`);
      return response.data;
    } catch (error) {
      this.logger.error("Failed to fetch WakaTime goals", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected async transform(
    data: WakaTimeGoal[]
  ): Promise<WakaTimeGoalRecord[]> {
    return data.map((goal) => ({
      goal_id: goal.id,
      title: goal.title ?? "",
      custom_title: goal.custom_title ?? "",
      type: goal.type ?? "",
      seconds: Math.round(goal.seconds || 0),
      status: goal.status ?? "",
      average_status: goal.average_status ?? "",
      range_text: goal.range_text ?? "",
      snoozed: goal.snoozed ? 1 : 0,
      modified_at: goal.modified_at
        ? goal.modified_at.slice(0, 19).replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " "),
    }));
  }
}
