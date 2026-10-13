// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import type { DailyEntry } from "../lib/types";
import { buildSeries, RANGES, toDays } from "../lib/usage";
import { DailyChart } from "./DailyChart";

/**
 * A phone fires compatibility mouse events after a tap. If those set hover,
 * the tooltip outlives the pin and a second tap can never dismiss it. Verified
 * in a real browser; this holds the behavior so it cannot regress silently.
 */
beforeAll(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

const daily: DailyEntry[] = ["2026-03-02", "2026-03-01"].map((date) => ({
  date,
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_tokens: 0,
  cache_read_tokens: 0,
  total_tokens: 1_000,
  cost: 1,
  by_source: [{ source: "Codex", total_tokens: 1_000, cost: 1 }],
}));

let root: Root | null = null;
let host: HTMLElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = host = null;
});

function mount(): HTMLElement {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root?.render(
      <DailyChart
        days={toDays(daily)}
        series={buildSeries(["Codex"])}
        filter={null}
        onClearFilter={() => {}}
        range={RANGES[0]}
        view="daily"
      />
    )
  );
  return host;
}

function tap(bar: Element) {
  act(() => {
    // Touch order: pointer events, then emulated mouse events, then click.
    bar.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "touch" })
    );
    bar.dispatchEvent(
      new PointerEvent("pointerenter", { pointerType: "touch" })
    );
    bar.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    bar.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("DailyChart tap tooltip", () => {
  test("a tap pins the tooltip and a second tap on the same bar dismisses it", () => {
    const el = mount();
    const bar = el.querySelector('[role="button"]');
    if (!bar) throw new Error("no bar rendered");
    expect(el.querySelector(".burns-tooltip")).toBeNull();

    tap(bar);
    expect(el.querySelector(".burns-tooltip")).not.toBeNull();

    tap(bar);
    expect(el.querySelector(".burns-tooltip")).toBeNull();
  });
});
