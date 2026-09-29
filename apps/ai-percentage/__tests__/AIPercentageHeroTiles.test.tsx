// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The three line-count tiles.
 *
 * They were inline `{(x / 1000).toFixed(1)}K` expressions, which produced two
 * wrong renderings that no test would have caught:
 *
 * - a repo under 1,000 lines showed `0.5K` — and an empty one `0.0K`, so a
 *   project with no lines at all reported a fifth of a thousand;
 * - the `k` tier had no upper bound, so 1,234,567 lines rendered `1234.6K`
 *   instead of switching to `m`.
 *
 * This file exists because `AIPercentageHero.test.tsx` mocks the query module
 * once at module scope with fixed values; `vi.mock` is hoisted per file, so a
 * second fixture needs a second file rather than a `beforeEach` override.
 */
const counts = vi.hoisted(() => ({
  ai_percentage: 42.5,
  total_lines_added: 10_000,
  ai_lines_added: 5_000,
  human_lines_added: 5_000,
}));

vi.mock("../lib/queries", () => ({
  getCurrentAICodePercentage: () => Promise.resolve(counts),
}));

import { AIPercentageHero } from "../components/AIPercentageHero";

/** The text of the value in the tile with the given label. */
function tileValue(label: string): string {
  const labelEl = screen.getByText(label);
  const tile = labelEl.parentElement;
  // The value is the sibling div after the label div.
  const value = tile?.querySelector(".tabular-nums")?.textContent?.trim();
  if (value === undefined) throw new Error(`no value rendered for "${label}"`);
  return value;
}

const mount = async () => {
  const view = render(<AIPercentageHero />);
  // Let the SWR promise settle so the tiles are rendered rather than the
  // loading branch.
  await vi.waitFor(() => expect(screen.getByText("Total Lines")).toBeTruthy());
  return view;
};

afterEach(() => {
  cleanup();
});

describe("line-count tiles", () => {
  it("shows the real count below 1,000, not a fraction of a thousand", async () => {
    counts.total_lines_added = 500;
    counts.ai_lines_added = 0;
    counts.human_lines_added = 500;
    await mount();

    // Previously `0.5K` and `0.0K`.
    expect(tileValue("Total Lines")).toBe("500");
    expect(tileValue("AI Lines")).toBe("0");
    expect(tileValue("Human Lines")).toBe("500");
  });

  it("switches to the m tier past a million rather than growing without bound", async () => {
    counts.total_lines_added = 1_234_567;
    counts.ai_lines_added = 1_000_000;
    counts.human_lines_added = 234_567;
    await mount();

    // Previously `1234.6K`, `1000.0K`, `234.6K`.
    expect(tileValue("Total Lines")).toBe("1.2m");
    expect(tileValue("AI Lines")).toBe("1.0m");
    expect(tileValue("Human Lines")).toBe("234.6k");
  });

  it("keeps the k tier for ordinary repositories", async () => {
    counts.total_lines_added = 10_000;
    counts.ai_lines_added = 5_000;
    counts.human_lines_added = 5_000;
    await mount();

    expect(tileValue("Total Lines")).toBe("10.0k");
    expect(tileValue("AI Lines")).toBe("5.0k");
    expect(tileValue("Human Lines")).toBe("5.0k");
  });

  it("renders all three tiles with their own label", async () => {
    counts.total_lines_added = 10_000;
    counts.ai_lines_added = 5_000;
    counts.human_lines_added = 5_000;
    await mount();

    for (const label of ["Total Lines", "AI Lines", "Human Lines"]) {
      expect(screen.getByText(label)).toBeTruthy();
      expect(tileValue(label)).not.toBe("");
    }
  });
});
