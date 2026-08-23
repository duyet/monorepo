import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../public");

describe("Cloudflare Pages _redirects", () => {
  const redirects = readFileSync(join(publicDir, "_redirects"), "utf8");

  it("no longer serves the SPA fallback (unknown URLs must 404)", () => {
    expect(redirects).not.toContain("/* /index.html 200");
  });

  it("retargets /mcp to the JSON-RPC endpoint with a method-preserving 308", () => {
    expect(redirects).toMatch(/^\/mcp https:\/\/mcp\.duyet\.net\/mcp 308$/m);
  });
});

describe("Cloudflare Pages 404 page", () => {
  const notFound = readFileSync(join(publicDir, "404.html"), "utf8");

  it("points agents at the machine-readable index", () => {
    expect(notFound).toContain("/llms.txt");
    expect(notFound).toContain("sitemap.xml");
    expect(notFound).toContain("/.well-known/api-catalog");
    expect(notFound).toContain("/developers");
    expect(notFound).not.toMatch(/<script/i);
  });
});

describe("Cloudflare Pages _routes.json", () => {
  const routes = JSON.parse(readFileSync(join(publicDir, "_routes.json"), "utf8")) as {
    version: number;
    include: string[];
    exclude: string[];
  };

  it("invokes functions for /, /index.html and /api/* only", () => {
    expect(routes.version).toBe(1);
    for (const route of ["/", "/index.html", "/api/*"]) {
      expect(routes.include).toContain(route);
    }
  });
});

describe("Cloudflare Pages _headers additions", () => {
  const headers = readFileSync(join(publicDir, "_headers"), "utf8");

  it("keeps existing rules intact and adds openapi + well-known CORS rules", () => {
    // Pre-existing rules that must survive.
    expect(headers).toMatch(/\/assets\/\*\n {2}Cache-Control: public, max-age=31536000/);
    expect(headers).toMatch(/\/llms\.txt\n {2}Content-Type: text\/plain/);

    // New rules.
    expect(headers).toMatch(/\/openapi\.json\n {2}Access-Control-Allow-Origin: \*\n {2}Cache-Control: public, max-age=300\n/);
    expect(headers).toMatch(/\/\.well-known\/\*\n {2}Access-Control-Allow-Origin: \*/);
  });

  it("does not duplicate Content-Type on /llms.txt (Pages joins duplicates)", () => {
    // Count rule lines (start of line), not prose mentions in comments.
    expect(headers.match(/^\/llms\.txt$/gm)).toHaveLength(1);
  });
});
