import type {
  AICodePercentageData,
  CurrentAICodePercentage,
  DateRangeDays,
} from "./types";
import { executeQuery, getClient } from "./clickhouse";
import { getDateCondition } from "./utils";
import type { ClickHouseClient } from "@clickhouse/client";

export async function getAICodePercentageHistory(
  days: DateRangeDays = 365
): Promise<AICodePercentageData[]> {
  const dateCondition = getDateCondition(days);

  const query = `
    SELECT
      date,
      ai_percentage,
      total_lines_added,
      human_lines_added,
      ai_lines_added,
      total_commits,
      human_commits,
      ai_commits
    FROM monorepo_ai_code_percentage
    ${dateCondition}
    ORDER BY date ASC
  `;

  const result = await executeQuery(query);

  if (!result.success || !result.data || result.data.length === 0) {
    return [];
  }

  return result.data.map((row) => ({
    date: String(row.date),
    ai_percentage: Number(row.ai_percentage) || 0,
    total_lines_added: Number(row.total_lines_added) || 0,
    human_lines_added: Number(row.human_lines_added) || 0,
    ai_lines_added: Number(row.ai_lines_added) || 0,
    total_commits: Number(row.total_commits) || 0,
    human_commits: Number(row.human_commits) || 0,
    ai_commits: Number(row.ai_commits) || 0,
  }));
}

export async function getCurrentAICodePercentage(): Promise<CurrentAICodePercentage | null> {
  const query = `
    SELECT
      ai_percentage,
      total_lines_added,
      human_lines_added,
      ai_lines_added
    FROM monorepo_ai_code_percentage
    ORDER BY date DESC
    LIMIT 1
  `;

  const result = await executeQuery(query);

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const data = result.data[0];

  return {
    ai_percentage: Number(data.ai_percentage) || 0,
    total_lines_added: Number(data.total_lines_added) || 0,
    human_lines_added: Number(data.human_lines_added) || 0,
    ai_lines_added: Number(data.ai_lines_added) || 0,
  };
}

export async function isAICodePercentageDataAvailable(): Promise<boolean> {
  const client = getClient();

  if (!client) {
    return false;
  }

  try {
    const query = `
      SELECT count() as count
      FROM monorepo_ai_code_percentage
      LIMIT 1
    `;

    const result = await client.query({
      query,
      format: "JSONEachRow",
    });

    const data = await result.json();
    return (
      Array.isArray(data) &&
      data.length > 0 &&
      Number((data[0] as any).count) > 0
    );
  } catch (error) {
    console.error("[AI Code Percentage] Check availability failed:", error);
    return false;
  }
}
