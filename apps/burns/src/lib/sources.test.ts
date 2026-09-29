import { describe, expect, test } from "vitest";
import { requiresFreshBurnsData } from "./freshness";
import { normalizeSource, SOURCE_COLORS, sourceSwatch } from "./sources";

describe("normalizeSource", () => {
  test("maps only raw antigravity to Google Antigravity", () => {
    expect(normalizeSource("antigravity")).toBe("Google Antigravity");
    expect(normalizeSource("google-antigravity")).toBe("Google Antigravity");
    expect(normalizeSource("Google Antigravity")).toBe("Google Antigravity");
  });

  test("maps gemini to Gemini CLI, never Antigravity", () => {
    for (const raw of ["gemini", "Gemini", "gemini-cli", "GEMINI"]) {
      expect(normalizeSource(raw)).toBe("Gemini CLI");
      expect(normalizeSource(raw)).not.toBe("Google Antigravity");
      expect(normalizeSource(raw).toLowerCase()).not.toContain("antigravity");
    }
  });

  test("does not treat agy as Antigravity", () => {
    expect(normalizeSource("agy")).not.toBe("Google Antigravity");
    expect(normalizeSource("strategy")).not.toBe("Google Antigravity");
  });

  test("keeps other raw sources on their own names", () => {
    expect(normalizeSource("ccusage")).toBe("Claude Code");
    expect(normalizeSource("claude-code")).toBe("Claude Code");
    expect(normalizeSource("codex")).toBe("Codex");
    expect(normalizeSource("opencode")).toBe("opencode");
    expect(normalizeSource("grok")).toBe("Grok");
    expect(normalizeSource("hermes")).toBe("Hermes");
    expect(normalizeSource("openclaw")).toBe("OpenClaw");
    expect(normalizeSource("pi")).toBe("pi");
    expect(normalizeSource("ccusage", "glm-4.6")).toBe("Z.AI");
    expect(normalizeSource("unknown-agent")).toBe("unknown-agent");
  });

  test("gemini stays Gemini even when the model looks like GLM", () => {
    expect(normalizeSource("gemini", "glm-4.6")).toBe("Gemini CLI");
  });
});

describe("source colors", () => {
  test("gemini and antigravity use different swatches", () => {
    expect(SOURCE_COLORS["Gemini CLI"]).toBeTruthy();
    expect(SOURCE_COLORS["Google Antigravity"]).toBeTruthy();
    expect(sourceSwatch("Gemini CLI")).not.toBe(
      sourceSwatch("Google Antigravity")
    );
  });

  test("Z.AI and Grok use distinct swatches", () => {
    expect(sourceSwatch("Z.AI")).not.toBe(sourceSwatch("Grok"));
  });
});

describe("requiresFreshBurnsData", () => {
  test("refreshes on cron, manual dispatch, and main-branch builds", () => {
    expect(requiresFreshBurnsData("schedule")).toBe(true);
    expect(requiresFreshBurnsData("workflow_dispatch")).toBe(true);
    expect(requiresFreshBurnsData("push", "refs/heads/main")).toBe(true);
  });

  test("keeps the committed snapshot for previews and local runs", () => {
    // Without this the script would hard-fail on a PR build that has no
    // MOTHERDUCK_TOKEN, and the committed public/token-data.json would go
    // stale on any push to a non-main branch.
    expect(requiresFreshBurnsData("pull_request")).toBe(false);
    expect(requiresFreshBurnsData("push", "refs/heads/feature")).toBe(false);
    expect(requiresFreshBurnsData(undefined, undefined)).toBe(false);
  });
});
