import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const llmsTxt = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../public/llms.txt"),
  "utf8"
);

describe("llms.txt agent guidance", () => {
  it("tells agents when the site is a good source", () => {
    expect(llmsTxt).toContain("When to use");
  });

  it("points at the developer portal and MCP server", () => {
    // The developer portal is the entry point for machine access.
    expect(llmsTxt).toContain("/developers");
    expect(llmsTxt).toContain("https://mcp.duyet.net/mcp");
  });

  it("exposes contact and legal pages", () => {
    expect(llmsTxt).toContain("/contact");
  });
});
