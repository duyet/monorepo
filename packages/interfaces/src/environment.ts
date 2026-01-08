/**
 * Common environment variables shared across all apps
 */
export interface CommonEnvironmentVariables {
  readonly NODE_ENV: "development" | "production" | "test";
  readonly NEXT_PUBLIC_MEASUREMENT_ID: string;
}

/**
 * Cross-app URLs for linking between applications
 */
export interface CrossAppUrls {
  readonly NEXT_PUBLIC_DUYET_BLOG_URL: string;
  readonly NEXT_PUBLIC_DUYET_INSIGHTS_URL: string;
  readonly NEXT_PUBLIC_DUYET_CV_URL: string;
}

/**
 * Base environment variables used by most apps
 */
export interface BaseEnvironmentVariables
  extends CommonEnvironmentVariables,
    CrossAppUrls {
  readonly NEXT_PUBLIC_BASE_URL: string;
}

/**
 * Full environment (used by blog app)
 */
export interface FullEnvironmentVariables extends BaseEnvironmentVariables {
  readonly NEXT_PUBLIC_GITHUB_REPO_URL: string;
}
