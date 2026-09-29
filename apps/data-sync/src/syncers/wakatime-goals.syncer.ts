import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";
import { clickHouseDateTime, clickHouseNow } from "../lib/clickhouse/format";
import { fetchWakaTimeJson, wakaTimeApiUrl } from "../lib/wakatime";

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

  protected async fetchFromApi(_options: SyncOptions): Promise<WakaTimeGoal[]> {
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WAKATIME_API_KEY environment variable not set");
    }

    const url = wakaTimeApiUrl("/users/current/goals", apiKey);

    this.logger.info("Fetching WakaTime goals");

    try {
      const response = await this.withRetry(() =>
        fetchWakaTimeJson<WakaTimeGoalsResponse>(url)
      );

      if (!response || !Array.isArray(response.data)) {
        throw new Error("WakaTime goals API returned invalid response format");
      }

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
        ? clickHouseDateTime(goal.modified_at)
        : clickHouseNow(),
    }));
  }
}
