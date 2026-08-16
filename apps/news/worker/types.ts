export interface Env {
  DB: D1Database;
  NEWS_INGEST: Workflow;
  ANYROUTER_BASE_URL: string;
  ANYROUTER_MODEL: string;
  ANYROUTER_API_KEY: string;
  CLICKHOUSE_HOST?: string;
  CLICKHOUSE_NEWS_USER?: string;
  CLICKHOUSE_NEWS_PASSWORD?: string;
  CLICKHOUSE_DATABASE?: string;
  NEWS_ADMIN_TOKEN: string;
  /** Cloudflare Email Sending binding. Optional: absent until Email Sending
   *  is onboarded for the account, so all use sites must guard for it. */
  EMAIL?: SendEmail;
}
