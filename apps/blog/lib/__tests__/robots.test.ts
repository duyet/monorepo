import { describe, expect, test } from "bun:test";

const SITE_URL = "https://blog.duyet.net";

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap

# LLM and AI agent resources
# llms.txt: ${SITE_URL}/llms.txt
# llms-full.txt: ${SITE_URL}/llms-full.txt
`;
}

describe("Robots.txt Generation", () => {
  test("should return robots.txt content", () => {
    const text = buildRobotsTxt();

    expect(text).toContain("User-agent: *");
    expect(text).toContain("Allow: /");
  });

  test("should include sitemap URLs", () => {
    const text = buildRobotsTxt();

    expect(text).toContain("Sitemap: https://blog.duyet.net/sitemap.xml");
    expect(text).toContain("Sitemap: https://blog.duyet.net/sitemap");
  });

  test("should include LLM references", () => {
    const text = buildRobotsTxt();

    expect(text).toContain("llms.txt");
    expect(text).toContain("llms-full.txt");
  });
});
