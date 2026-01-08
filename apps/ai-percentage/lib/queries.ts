import type {
  AICodePercentageData,
  CurrentAICodePercentage,
  DateRangeDays,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.duyet.net";

async function fetchFromAPI<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`[AI Code Percentage] Fetch from ${endpoint} failed:`, error);
    return null;
  }
}

export async function getAICodePercentageHistory(
  days: DateRangeDays = 365
): Promise<AICodePercentageData[]> {
  const result = await fetchFromAPI<{ data: AICodePercentageData[] }>(
    `/api/ai/percentage/history?days=${days}`
  );

  return result?.data || [];
}

export async function getCurrentAICodePercentage(): Promise<CurrentAICodePercentage | null> {
  return await fetchFromAPI<CurrentAICodePercentage>(
    "/api/ai/percentage/current"
  );
}

export async function isAICodePercentageDataAvailable(): Promise<boolean> {
  const result = await fetchFromAPI<{ available: boolean }>(
    "/api/ai/percentage/available"
  );
  return result?.available || false;
}
