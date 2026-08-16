export interface Env {
  DB: D1Database;
  NEWS_INGEST: Workflow;
  ANYROUTER_BASE_URL: string;
  /** One model id, or a comma-separated fallback chain tried in order. */
  ANYROUTER_MODEL: string;
  /** Per-task overrides, same comma-separated semantics as ANYROUTER_MODEL.
   *  Fall back to ANYROUTER_MODEL when unset. */
  ANYROUTER_TRANSLATE_MODEL?: string;
  ANYROUTER_TLDR_MODEL?: string;
  /** Cheaper chain for judging translation quality. Falls back to
   *  ANYROUTER_MODEL when unset. */
  ANYROUTER_QA_MODEL?: string;
  ANYROUTER_API_KEY: string;
  CLICKHOUSE_HOST?: string;
  CLICKHOUSE_NEWS_USER?: string;
  CLICKHOUSE_NEWS_PASSWORD?: string;
  CLICKHOUSE_DATABASE?: string;
  NEWS_ADMIN_TOKEN: string;
  /** Clerk instance issuer (frontend API origin), e.g. "https://clerk.duyet.net".
   *  Derived from the VITE_CLERK_PUBLISHABLE_KEY domain. When set, admin
   *  Clerk-JWT verification rejects tokens whose `iss` doesn't match. */
  CLERK_ISSUER?: string;
  /** Comma-separated Clerk user ids (the token's `sub`) granted admin
   *  access, independent of any role claim. */
  NEWS_ADMIN_USER_IDS?: string;
  /** Telegram bot token for channel posting (secret). Optional: the
   *  telegram step no-ops when unset. */
  TELEGRAM_BOT_TOKEN?: string;
  /** Telegram channel/chat id to post stories to, e.g. "-1004420104760". */
  TELEGRAM_CHAT_ID?: string;
  /** Cloudflare Email Sending binding. Optional: absent until Email Sending
   *  is onboarded for the account, so all use sites must guard for it. */
  EMAIL?: SendEmail;
}
