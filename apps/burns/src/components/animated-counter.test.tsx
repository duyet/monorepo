import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { countEm } from "../lib/count";
import { AnimatedCounter } from "./AnimatedCounter";

/**
 * The prerendered HTML is what a phone paints before hydration, so the count
 * has to arrive already sized for the digits it contains. Asserting the markup
 * is the only way to hold that: the size itself is a stylesheet concern, and
 * the measurement that replaces it needs a browser to run.
 */
function markup(target: number): string {
  return renderToStaticMarkup(<AnimatedCounter target={target} />);
}

describe("AnimatedCounter markup", () => {
  test("publishes the final string's width as --count-em", () => {
    // The count starts at 0 on both sides of hydration, so --count-em is what
    // sizes the pre-hydration paint; it has to describe the target, not "0".
    const html = markup(163_813_446_180);
    expect(html).toContain(
      `--count-em:${countEm((163_813_446_180).toLocaleString("en-US"))}`
    );
  });

  test("carries the target in a hidden probe for the measured fit", () => {
    const html = markup(163_813_446_180);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("163,813,446,180");
    // Once, in the probe. The visible count is still counting up from 0.
    expect(html.match(/163,813,446,180/g)).toHaveLength(1);
  });

  test("counts up from 0, so the prerendered paint matches hydration", () => {
    expect(markup(163_813_446_180)).toContain(">0</span>");
  });
});
