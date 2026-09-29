// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AICodePercentageData, DateRangeDays } from "../lib/types";

const historyCalls: DateRangeDays[] = [];

vi.mock("../lib/queries", () => ({
  getAICodePercentageHistory: (days: DateRangeDays) => {
    historyCalls.push(days);
    return Promise.resolve([] as AICodePercentageData[]);
  },
  getCurrentAICodePercentage: () => Promise.resolve(null),
}));

import { Page } from "../src/routes/index";

const setRange = (value: string) => {
  const select = document.querySelector<HTMLSelectElement>("#time-range");
  if (!select) throw new Error("time range select not found");
  fireEvent.change(select, { target: { value } });
};

const settle = () =>
  act(async () => {
    await Promise.resolve();
  });

describe("ai-percentage time range selector", () => {
  afterEach(() => {
    cleanup();
    historyCalls.length = 0;
  });

  it("requests the default range on first paint", async () => {
    render(<Page />);
    await settle();
    expect(historyCalls.length).toBeGreaterThan(0);
    expect(historyCalls.every((d) => d === 365)).toBe(true);
  });

  it.each([
    ["30d", 30],
    ["90d", 90],
    ["6m", 180],
    ["all", "all"],
  ])(
    "re-requests the history for %s after selecting it",
    async (value, days) => {
      render(<Page />);
      await settle();
      const before = historyCalls.length;

      setRange(value);
      await settle();

      expect(historyCalls.length).toBeGreaterThan(before);
      expect(historyCalls.at(-1)).toBe(days);
    }
  );
});
