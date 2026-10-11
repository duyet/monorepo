/**
 * Environment variables for the insights app
 * See @duyet/interfaces for shared environment type definitions
 *
 * Members are mutable and optional on purpose. This augments the `ProcessEnv`
 * interface declared by `@types/node` (`interface ProcessEnv extends
 * Dict<string> {}`), whose members are plain writable properties. Declaring
 * them `readonly` makes assignment and `delete` fail to compile (TS2540 /
 * TS2704), and declaring them required makes `delete process.env.X` fail
 * (TS2790) — both of which are the documented ways to test env-dependent
 * code in Vitest. These vars are also genuinely absent at runtime when
 * unconfigured.
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    // Common variables (from CommonEnvironmentVariables)
    NODE_ENV?: "development" | "production" | "test";

    // Insights-specific API keys (server-side only)
    GITHUB_TOKEN?: string;
    WAKATIME_API_KEY?: string;
    CLOUDFLARE_API_TOKEN?: string;
    CLOUDFLARE_API_KEY?: string;
    CLOUDFLARE_ZONE_ID?: string;
    POSTHOG_API_KEY?: string;
    POSTHOG_PROJECT_ID?: string;

    // ClickHouse
    CLICKHOUSE_HOST?: string;
    CLICKHOUSE_PORT?: string;
    CLICKHOUSE_USER?: string;
    CLICKHOUSE_PASSWORD?: string;
    CLICKHOUSE_DATABASE?: string;
    CLICKHOUSE_PROTOCOL?: string;
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
