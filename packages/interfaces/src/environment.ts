/**
 * Common environment variables shared across all apps
 */
export interface CommonEnvironmentVariables {
  readonly NODE_ENV: "development" | "production" | "test";
  readonly NEXT_PUBLIC_MEASUREMENT_ID: string;
}

/**
 * Auth0 authentication variables (used by blog app)
 *
 * Note: AUTH0_CLIENT_ID is intentionally public (NEXT_PUBLIC_) as OAuth Client IDs
 * are designed to be exposed to browsers for authentication flows.
 * The sensitive secret is AUTH0_CLIENT_SECRET (server-side only).
 */
export interface Auth0Variables {
  readonly NEXT_PUBLIC_AUTH0_DOMAIN: string;
  readonly NEXT_PUBLIC_AUTH0_CLIENT_ID: string;
  readonly NEXT_PUBLIC_AUTH0_ADMIN_EMAIL: string;
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
