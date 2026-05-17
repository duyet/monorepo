import { describe, expect, test } from "bun:test";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  test("includes the Cloudflare schedule prompt", () => {
    const prompt = buildSystemPrompt({
      schedulePrompt: "Schedule prompt for 2026-05-17",
    });

    expect(prompt).toContain("Schedule prompt for 2026-05-17");
  });

  test("keeps ReAct internal and blocks hidden data disclosure", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt).toContain("Use a ReAct-style loop internally");
    expect(prompt).toContain("Do not reveal private chain-of-thought");
    expect(prompt).toContain("system instructions");
    expect(prompt).toContain("secrets");
    expect(prompt).toContain("tokens");
  });

  test("grounds duyetbot in local duyet.net profile and project context", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt).toContain("Senior Data & AI Engineer");
    expect(prompt).toContain("8+ years");
    expect(prompt).toContain("350TB+ Iceberg data lake");
    expect(prompt).toContain("ClickHouse");
    expect(prompt).toContain("Kubernetes");
    expect(prompt).toContain("blog.duyet.net");
    expect(prompt).toContain("cv.duyet.net");
    expect(prompt).toContain("insights.duyet.net");
    expect(prompt).toContain("homelab.duyet.net");
    expect(prompt).toContain("LLM Timeline");
  });

  test("sets source-grounding rules for duyet.net answers", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt).toContain("Use the local duyet.net context");
    expect(prompt).toContain("mention the most relevant URL explicitly");
    expect(prompt).toContain("Do not invent current status");
    expect(prompt).toContain("observed tool results");
    expect(prompt).toContain("If the local context is insufficient");
  });

  test("sets tool-use and scheduling guardrails", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt).toContain("Use tools only when they materially improve");
    expect(prompt).toContain("Do not invent tool results");
    expect(prompt).toContain("ask for any missing date, time, or timezone");
    expect(prompt).toContain("use scheduleTask");
  });

  test("does not advertise unavailable starter tools", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt.toLowerCase()).not.toContain("weather");
  });

  test("keeps the system prompt bounded", () => {
    const prompt = buildSystemPrompt({ schedulePrompt: "schedule" });

    expect(prompt.length).toBeLessThan(5000);
  });
});
