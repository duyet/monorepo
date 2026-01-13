#!/usr/bin/env bun
/**
 * Environment Variable Audit
 * Reviews all env vars and categorizes as public (NEXT_PUBLIC_*) or secret
 */

const ALL_VARS = [
  // ===== CROSS-APP URLs (PUBLIC) =====
  { name: "NEXT_PUBLIC_DUYET_BLOG_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_CV_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_HOMELAB_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_INSIGHTS_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_PHOTOS_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_HOME_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_API_BASE_URL", public: true, sensitive: false },
  { name: "NEXT_PUBLIC_DUYET_AI_URL", public: true, sensitive: false },

  // ===== BLOG APP =====
  // Auth0 - Client IDs are designed to be public for OAuth flows (the secret is AUTH0_CLIENT_SECRET)
  { name: "NEXT_PUBLIC_AUTH0_DOMAIN", public: true, sensitive: false }, // Public domain
  { name: "NEXT_PUBLIC_AUTH0_CLIENT_ID", public: true, sensitive: false }, // ✅ OK - OAuth Client IDs are public by design
  { name: "NEXT_PUBLIC_AUTH0_ADMIN_EMAIL", public: true, sensitive: false }, // Public email
  // Vercel KV
  { name: "KV_URL", public: false, sensitive: true },
  { name: "KV_REST_API_URL", public: false, sensitive: true },
  { name: "KV_REST_API_TOKEN", public: false, sensitive: true },
  { name: "KV_REST_API_READ_ONLY_TOKEN", public: false, sensitive: true },
  // Postgres
  { name: "POSTGRES_URL", public: false, sensitive: true },
  { name: "POSTGRES_URL_NON_POOLING", public: false, sensitive: true },
  { name: "POSTGRES_PRISMA_URL", public: false, sensitive: true },
  { name: "POSTGRES_HOST", public: false, sensitive: true },
  { name: "POSTGRES_DATABASE", public: false, sensitive: true },
  { name: "POSTGRES_USER", public: false, sensitive: true },
  { name: "POSTGRES_PASSWORD", public: false, sensitive: true },
  // Analytics
  { name: "POSTHOG_API_KEY", public: false, sensitive: true },
  { name: "POSTHOG_PROJECT_ID", public: false, sensitive: true },
  { name: "NEXT_PUBLIC_MEASUREMENT_ID", public: true, sensitive: false }, // GA tracking ID is public
  { name: "NEXT_PUBLIC_AXIOM_DATASET", public: true, sensitive: false }, // Dataset name is public
  { name: "NEXT_PUBLIC_SELINE_TOKEN", public: true, sensitive: false }, // ✅ OK - Public tracking token (like GA measurement ID)

  // ===== INSIGHTS APP =====
  { name: "GITHUB_TOKEN", public: false, sensitive: true },
  { name: "WAKATIME_API_KEY", public: false, sensitive: true },
  { name: "CLOUDFLARE_API_KEY", public: false, sensitive: true },
  { name: "CLOUDFLARE_API_TOKEN", public: false, sensitive: true }, // ✅ OK - Server-side only API token
  { name: "CLOUDFLARE_ZONE_ID", public: false, sensitive: true },
  { name: "CLOUDFLARE_EMAIL", public: false, sensitive: true },
  { name: "CLICKHOUSE_HOST", public: false, sensitive: true },
  { name: "CLICKHOUSE_PORT", public: false, sensitive: true },
  { name: "CLICKHOUSE_USER", public: false, sensitive: true },
  { name: "CLICKHOUSE_PASSWORD", public: false, sensitive: true },
  { name: "CLICKHOUSE_DATABASE", public: false, sensitive: true },
  { name: "CLICKHOUSE_PROTOCOL", public: false, sensitive: true },
  { name: "NEXT_PUBLIC_MEASUREMENT_ID", public: true, sensitive: false },

  // ===== PHOTOS APP =====
  { name: "UNSPLASH_ACCESS_KEY", public: false, sensitive: true }, // ✅ OK - Server-side only API key
  { name: "UNSPLASH_USERNAME", public: true, sensitive: false }, // Public username
  { name: "CLOUDINARY_CLOUD_NAME", public: true, sensitive: false }, // Cloud name is visible in URLs
  { name: "CLOUDINARY_API_KEY", public: false, sensitive: true },
  { name: "CLOUDINARY_API_SECRET", public: false, sensitive: true },
  { name: "CLOUDINARY_FOLDER", public: true, sensitive: false }, // Folder name is not sensitive
  { name: "PHOTOS_OWNER_USERNAME", public: true, sensitive: false }, // Public username

  // ===== API APP =====
  { name: "OPENROUTER_API_KEY", public: false, sensitive: true },
];

const ISSUES = ALL_VARS.filter((v) => v.public && v.sensitive);

console.log("=== ENVIRONMENT VARIABLE AUDIT ===\n");

if (ISSUES.length > 0) {
  console.log(
    "❌ CRITICAL: Found variables with NEXT_PUBLIC_ prefix that contain sensitive data:\n"
  );
  for (const issue of ISSUES) {
    console.log(`  ❌ ${issue.name}`);
    console.log(`     → Rename to: ${issue.name.replace("NEXT_PUBLIC_", "")}`);
    console.log(`     → Update code to use server-side only\n`);
  }
} else {
  console.log("✅ All environment variables are correctly categorized!\n");
  console.log("Security notes:");
  console.log("  • Auth0 Client IDs (NEXT_PUBLIC_AUTH0_CLIENT_ID) are public by OAuth design");
  console.log("  • Tracking tokens (NEXT_PUBLIC_SELINE_TOKEN, NEXT_PUBLIC_MEASUREMENT_ID) are public by design");
  console.log("  • API secrets (CLOUDFLARE_API_TOKEN, UNSPLASH_ACCESS_KEY, etc.) are server-side only");
}
