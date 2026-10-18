import { describe, expect, it } from "vitest";
import { buildInsightNotes, pickInsight } from "./insights";
import type { TokenData } from "./types";

const data: TokenData = {
  generatedAt: "2026-10-18T00:00:00.000Z",
  firstDate: "2026-01-01",
  lastDate: "2026-10-18",
  sources: ["claude"],
  totals: {
    input_tokens: 100,
    output_tokens: 200,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: 346_883,
    total_cost: 10,
  },
  source_totals: [],
  daily: [],
};

describe("insights", () => {
  it("builds at least one note", () => {
    const notes = buildInsightNotes(data);
    expect(notes.length).toBeGreaterThan(0);
  });
  it("pickInsight returns a note", () => {
    expect(pickInsight(data)).not.toBeNull();
  });
  it("insight override wins", () => {
    expect(pickInsight({ ...data, insight: "custom note" })).toBe("custom note");
  });
});
