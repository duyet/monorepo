import { describe, expect, it } from "vitest";
import {
  alertAdapters,
  jsonAlertAdapter,
  renderSlackPayload,
  renderTelegramHtml,
  slackAlertAdapter,
  telegramAlertAdapter,
} from "../notify/adapters.js";
import {
  buildHealthSnapshot,
  type AlertEvent,
  formatHealthFooter,
  healthOk,
} from "../notify/alert.js";

const event: AlertEvent = {
  severity: "warning",
  source: "news.duyet.net",
  title: "GPT-6 <beats> humans & robots",
  summary: "A <script>alert(1)</script> summary",
  metrics: [{ label: "rank", value: "31" }],
  links: [{ label: "open", url: "https://news.duyet.net/llm/abc" }],
  timestamp: Date.UTC(2026, 7, 19, 8, 0, 0),
  health: buildHealthSnapshot({
    lastRunError: null,
    lastRunFinishedAt: Date.UTC(2026, 7, 19, 7, 0, 0),
    translationCoverage: 0.92,
    now: Date.UTC(2026, 7, 19, 8, 0, 0),
  }),
};

describe("AlertEvent adapters", () => {
  it("registers telegram, slack, and json adapters", () => {
    expect(alertAdapters.map((adapter) => adapter.id)).toEqual([
      "telegram",
      "slack",
      "json",
    ]);
  });

  it("escapes HTML in the Telegram payload", () => {
    const html = renderTelegramHtml(event);
    expect(html).toContain("⚠️");
    expect(html).toContain("GPT-6 &lt;beats&gt; humans &amp; robots");
    expect(html).not.toContain("<script>");
    expect(html).toContain("A &lt;script&gt;alert(1)&lt;/script&gt; summary");
    expect(html).toContain("rank");
    expect(html).toContain("health: all 2 ok");
    expect(html).toContain('href="https://news.duyet.net/llm/abc"');
    expect(telegramAlertAdapter.render(event)).toBe(html);
  });

  it("renders a Slack attachment with metrics and health", () => {
    const payload = renderSlackPayload(event);
    expect(payload.text).toContain("GPT-6 <beats> humans & robots");
    expect(payload.attachments[0].fields).toEqual(
      expect.arrayContaining([
        { title: "rank", value: "31", short: true },
        { title: "Health", value: "health: all 2 ok", short: false },
      ])
    );
    expect(slackAlertAdapter.render(event)).toEqual(payload);
  });

  it("JSON adapter returns the event unchanged", () => {
    expect(jsonAlertAdapter.render(event)).toBe(event);
  });
});

describe("health snapshot", () => {
  it("marks ingest down when the last run errored", () => {
    const snapshot = buildHealthSnapshot({
      lastRunError: "timeout",
      translationCoverage: 0.4,
    });
    expect(healthOk(snapshot)).toBe(false);
    expect(formatHealthFooter(snapshot)).toContain("ingest");
    expect(formatHealthFooter(snapshot)).toContain("translations");
  });
});
