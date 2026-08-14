import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { SOURCE_COLORS, normalizeSource, sourceSwatch } from "./sources";

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

describe("source colors", () => {
  test("gemini and antigravity use different swatches", () => {
    expect(SOURCE_COLORS["Gemini CLI"]).toBeTruthy();
    expect(SOURCE_COLORS["Google Antigravity"]).toBeTruthy();
    expect(sourceSwatch("Gemini CLI")).not.toBe(sourceSwatch("Google Antigravity"));
  });

  test("Z.AI and Grok use distinct swatches", () => {
    expect(sourceSwatch("Z.AI")).not.toBe(sourceSwatch("Grok"));
  });
});

describe("fetch-burns-data mapping", () => {
  test("maps gemini and antigravity independently via normalizeSource", () => {
    expect(normalizeSource("gemini")).toBe("Gemini CLI");
    expect(normalizeSource("antigravity")).toBe("Google Antigravity");
    expect(normalizeSource("gemini")).not.toBe(normalizeSource("antigravity"));

    const fetchSrc = readFileSync(join(burnsRoot, "scripts/fetch-burns-data.ts"), "utf8");
    expect(fetchSrc).toContain("normalizeSource(");
    expect(fetchSrc).not.toContain("IN ('antigravity', 'gemini')");
    expect(fetchSrc).not.toMatch(/source\s*=\s*'gemini'\s+THEN\s+'Google Antigravity'/i);
  });
});
