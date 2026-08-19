import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));
const main = readFileSync(join(dir, "main.tsx"), "utf8");
const shell = readFileSync(join(dir, "../index.html"), "utf8");

describe("agent-ui boot shell", () => {
  it("marks the Cloudflare entry as ran so retries do not double-mount", () => {
    expect(main).toContain("__CF_ENTRY_RAN__");
    expect(main).toContain("createRoot(rootElement)");
  });

  it("hydrates the chatbot-template surface even when Clerk is unavailable", () => {
    expect(main).toContain("Ask Duyet anything");
    expect(main).toContain("ChatConversation");
    expect(main).toContain("PromptForm");
    expect(main).not.toContain("Authentication is not configured");
  });

  it("does not ship the static Chat shell stub", () => {
    expect(shell).toContain("Ask Duyet anything.");
    expect(shell).not.toContain("Chat shell");
    expect(shell).toContain("<header>");
    expect(shell).toContain("<main>");
  });
});
