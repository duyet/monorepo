/**
 * Environment variables for the insights app
 * See @duyet/interfaces for shared environment type definitions
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    // Common variables (from CommonEnvironmentVariables)
    readonly NODE_ENV: "development" | "production" | "test";

    // Insights-specific API keys (server-side only)
    readonly GITHUB_TOKEN: string;
    readonly WAKATIME_API_KEY: string;
    readonly CLOUDFLARE_API_TOKEN: string;
    readonly CLOUDFLARE_API_KEY: string;
    readonly CLOUDFLARE_ZONE_ID: string;
    readonly POSTHOG_API_KEY: string;
    readonly POSTHOG_PROJECT_ID: string;

    // ClickHouse
    readonly CLICKHOUSE_HOST: string;
    readonly CLICKHOUSE_PORT: string;
    readonly CLICKHOUSE_USER: string;
    readonly CLICKHOUSE_PASSWORD: string;
    readonly CLICKHOUSE_DATABASE: string;
    readonly CLICKHOUSE_PROTOCOL: string;
  }
}

interface ImportMetaEnv {
  // Public variables exposed to the client via Vite
  readonly VITE_MEASUREMENT_ID: string;
  readonly VITE_DUYET_BLOG_URL: string;
  readonly VITE_DUYET_INSIGHTS_URL: string;
  readonly VITE_DUYET_CV_URL: string;
  readonly VITE_BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
