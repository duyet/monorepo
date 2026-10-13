import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { requiresFreshBurnsData } from "./freshness";
import { fmtCost, fmtTokens, normalizeSource } from "./sources";

const burnsRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

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

describe("fmtTokens", () => {
  test("formats a small token count with the burns locale grouping", () => {
    expect(fmtTokens(1234)).toBe("1,234");
  });
});

describe("fmtCost", () => {
  test("shows cents below $10, whole dollars from $10, commas from $1,000", () => {
    expect(fmtCost(0)).toBe("$0.00");
    expect(fmtCost(0.27)).toBe("$0.27");
    expect(fmtCost(12.5)).toBe("$13");
    expect(fmtCost(319041.45)).toBe("$319,041");
  });
});

describe("fetch-burns-data mapping", () => {
  const fetchSrc = readFileSync(
    join(burnsRoot, "scripts/fetch-burns-data.ts"),
    "utf8"
  );

  test("maps gemini and antigravity independently via normalizeSource", () => {
    expect(normalizeSource("gemini")).toBe("Gemini CLI");
    expect(normalizeSource("antigravity")).toBe("Google Antigravity");
    expect(normalizeSource("gemini")).not.toBe(normalizeSource("antigravity"));

    expect(fetchSrc).toContain("normalizeSource(");
    expect(fetchSrc).not.toContain("IN ('antigravity', 'gemini')");
    expect(fetchSrc).not.toMatch(
      /source\s*=\s*'gemini'\s+THEN\s+'Google Antigravity'/i
    );
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
