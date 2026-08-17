import { describe, expect, it } from "vitest";
import { weeksFromJoguber } from "../src/lib/github-contributions";

function daysFrom(start: string, n: number) {
  const out = [];
  const d = new Date(`${start}T00:00:00Z`);
  for (let i = 0; i < n; i++) {
    out.push({
      date: d.toISOString().slice(0, 10),
      count: i % 5,
      level: i % 5,
    });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

describe("weeksFromJoguber", () => {
  it("returns empty for no days", () => {
    expect(weeksFromJoguber([])).toEqual([]);
  });

  it("aligns weeks to Sunday and drops a short trailing week", () => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 399);
    const weeks = weeksFromJoguber(
      daysFrom(start.toISOString().slice(0, 10), 400),
    );
    expect(weeks.length).toBeGreaterThan(40);
    expect(weeks[0]).toHaveLength(7);
    expect(new Date(`${weeks[0][0].date}T00:00:00Z`).getUTCDay()).toBe(0);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
});
