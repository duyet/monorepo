#!/usr/bin/env tsx
/**
 * Post-deploy smoke test for news.duyet.net.
 *
 * Hits the live site over plain HTTP and checks the handful of routes/API
 * shapes that matter most: the SSR shell renders, the feed + story APIs
 * return data with the right shape (including the prefix-lookup regression
 * check for a previously-fixed D1 LIKE-query bug), the system stats API
 * exposes the fields /system and /about read, every top-level static route
 * responds, the admin API rejects unauthenticated requests, and the
 * subscribe API rejects bad input without ever 500ing.
 *
 * Usage:
 *   pnpm run smoke [--base https://news.duyet.net]
 *
 * Exits non-zero if any check fails.
 */

const DEFAULT_BASE = "https://news.duyet.net";

function parseBase(argv: string[]): string {
  const flagIndex = argv.indexOf("--base");
  if (flagIndex !== -1 && argv[flagIndex + 1]) {
    return argv[flagIndex + 1].replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

const base = parseBase(process.argv.slice(2));

interface CheckResult {
  name: string;
  ok: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

async function check(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`[PASS] ${name}`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    results.push({ name, ok: false, detail });
    console.log(`[FAIL] ${name} — ${detail}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Smoke testing ${base}\n`);

  // 1. Root shell renders (SSR default lang is "vi") with share tags + stories.
  await check("GET / -> 200 with SSR shell marker", async () => {
    const res = await fetch(`${base}/`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const body = await res.text();
    const marker = "Hôm nay AI có gì mới?";
    assert(body.includes(marker), `body missing shell marker "${marker}"`);
    assert(body.includes("og:title"), "homepage missing og:title");
    assert(body.includes("twitter:card"), "homepage missing twitter:card");
    assert(body.includes('rel="canonical"'), "homepage missing canonical");
    assert(
      /href="\/[a-z0-9-]+\/[0-9a-f]{8}"/.test(body),
      "homepage HTML has no story permalinks"
    );
  });

  await check(
    "GET /sitemap.xml -> 200 application/xml with urlset",
    async () => {
      const res = await fetch(`${base}/sitemap.xml`);
      assert(res.status === 200, `expected 200, got ${res.status}`);
      const ctype = res.headers.get("content-type") ?? "";
      assert(ctype.includes("xml"), `expected xml content-type, got ${ctype}`);
      const body = await res.text();
      assert(body.includes("<urlset"), "sitemap missing <urlset>");
      assert(body.includes(`${base}/`), "sitemap missing homepage loc");
    }
  );

  await check("GET /robots.txt includes Sitemap line", async () => {
    const res = await fetch(`${base}/robots.txt`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const body = await res.text();
    assert(
      /Sitemap:\s*https:\/\/news\.duyet\.net\/sitemap\.xml/i.test(body),
      "robots.txt missing Sitemap line"
    );
  });

  // 2. Feed API shape + story-by-id regression checks.
  let firstItemId: string | null = null;
  await check("GET /api/feed -> 200 with days[] and categories[]", async () => {
    const res = await fetch(`${base}/api/feed`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const body = await res.json();
    assert(Array.isArray(body.days), "body.days is not an array");
    assert(Array.isArray(body.categories), "body.categories is not an array");
    const firstDayWithItems = body.days.find(
      (d: { items?: unknown[] }) => Array.isArray(d.items) && d.items.length > 0
    );
    assert(firstDayWithItems, "no day with items found in feed response");
    const firstItem = firstDayWithItems.items[0];
    assert(
      typeof firstItem?.id === "string" && firstItem.id.length > 0,
      "first item has no id"
    );
    firstItemId = firstItem.id;
  });

  await check("GET /api/story/<full-id> -> 200 with matching id", async () => {
    assert(firstItemId, "no item id from feed check to look up");
    const res = await fetch(`${base}/api/story/${firstItemId}`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const body = await res.json();
    assert(
      body.id === firstItemId,
      `expected id ${firstItemId}, got ${body.id}`
    );
  });

  await check(
    "GET /api/story/<8-char-prefix> -> 200 (prefix lookup)",
    async () => {
      assert(firstItemId, "no item id from feed check to look up");
      const prefix = firstItemId.slice(0, 8);
      const res = await fetch(`${base}/api/story/${prefix}`);
      assert(res.status === 200, `expected 200, got ${res.status}`);
      const body = await res.json();
      assert(
        typeof body.id === "string" && body.id.startsWith(prefix),
        `expected id starting with ${prefix}, got ${body.id}`
      );
    }
  );

  // 3. System stats API shape.
  await check("GET /api/system -> 200 with models and totals", async () => {
    const res = await fetch(`${base}/api/system`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const body = await res.json();
    assert(
      body.models && typeof body.models === "object",
      "body.models missing"
    );
    assert(
      body.totals && typeof body.totals === "object",
      "body.totals missing"
    );
    assert(typeof body.totals.items === "number", "body.totals.items missing");
  });

  // 4. Static top-level routes all render.
  const staticRoutes = [
    "/about",
    "/submit",
    "/mcp",
    "/changelog",
    "/subscribe",
    "/data",
  ];
  for (const route of staticRoutes) {
    await check(`GET ${route} -> 200`, async () => {
      const res = await fetch(`${base}${route}`);
      assert(res.status === 200, `expected 200, got ${res.status}`);
    });
  }

  // 5. Admin API rejects unauthenticated requests.
  await check("GET /api/admin/status without auth -> 401", async () => {
    const res = await fetch(`${base}/api/admin/status`);
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  // 6. Subscribe API rejects invalid input without 500ing, and answers
  // CORS preflight from the blog (TanStack SPA must not swallow OPTIONS).
  await check(
    "POST /api/subscribe with invalid email -> 4xx, not 5xx",
    async () => {
      const res = await fetch(`${base}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      });
      assert(
        res.status >= 400 && res.status < 500,
        `expected 4xx, got ${res.status}`
      );
    }
  );

  await check(
    "OPTIONS /api/subscribe from blog.duyet.net -> CORS 204, not HTML",
    async () => {
      const res = await fetch(`${base}/api/subscribe`, {
        method: "OPTIONS",
        headers: {
          Origin: "https://blog.duyet.net",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      });
      assert(
        res.status === 204 || res.status === 200,
        `expected 204/200, got ${res.status}`
      );
      const ctype = res.headers.get("content-type") ?? "";
      assert(
        !ctype.includes("text/html"),
        `preflight returned HTML (${ctype})`
      );
      assert(
        res.headers.get("Access-Control-Allow-Origin") ===
          "https://blog.duyet.net",
        `missing ACAO, got ${res.headers.get("Access-Control-Allow-Origin")}`
      );
    }
  );

  await check(
    "POST /api/subscribe from blog.duyet.net includes ACAO",
    async () => {
      const res = await fetch(`${base}/api/subscribe`, {
        method: "POST",
        headers: {
          Origin: "https://blog.duyet.net",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "not-an-email" }),
      });
      assert(
        res.headers.get("Access-Control-Allow-Origin") ===
          "https://blog.duyet.net",
        `missing ACAO, got ${res.headers.get("Access-Control-Allow-Origin")}`
      );
    }
  );

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed`
  );
  if (failed.length > 0) {
    console.log(`\nFailed checks:`);
    for (const f of failed) {
      console.log(`  - ${f.name}: ${f.detail}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Smoke test crashed:", e);
  process.exit(1);
});
