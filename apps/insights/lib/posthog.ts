/**
 * PostHog Client Configuration and Utilities
 *
 * Provides a centralized, validated PostHog client for analytics queries.
 * Handles missing environment variables gracefully and prevents silent failures.
 */

import { posthogConfig } from "@duyet/config";

interface PostHogConfig {
  apiKey: string;
  projectId: string;
  apiUrl: string;
}

interface PostHogResponse {
  cache_key: string;
  is_cached: boolean;
  columns: string[];
  error: string | null;
  hasMore: boolean;
  hogql: string;
  last_refresh: string;
  limit: number;
  offset: number;
  modifiers: object;
  types: string[][];
  results: (string | number)[][];
  timezone: string;
}

/**
 * Validates and returns PostHog configuration
 * Returns null if required environment variables are missing
 */
export function getPostHogConfig(): PostHogConfig | null {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[PostHog] Missing configuration:",
        !apiKey ? "POSTHOG_API_KEY" : "",
        !projectId ? "POSTHOG_PROJECT_ID" : ""
      );
    }
    return null;
  }

  return {
    apiKey,
    projectId,
    apiUrl: `${posthogConfig.baseUrl}${posthogConfig.endpoints.query(projectId)}`,
  };
}

/**
 * Checks if PostHog is properly configured
 */
export function isPostHogConfigured(): boolean {
  return getPostHogConfig() !== null;
}

/**
 * Makes a validated query to PostHog API
 * Returns null if configuration is invalid or request fails
 */
export async function queryPostHog(
  query: object
): Promise<PostHogResponse | null> {
  const config = getPostHogConfig();

  if (!config) {
    return null;
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      cache: "force-cache",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": posthogConfig.headers.contentType,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error(
        `[PostHog] API request failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as PostHogResponse;

    // Check for API-level errors
    if (data.error) {
      console.error("[PostHog] API returned error:", data.error);
      return null;
    }

    return data;
  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PostHog] Request failed:", errorMessage);
    return null;
  }
}
