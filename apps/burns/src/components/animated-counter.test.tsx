import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { AnimatedCounter } from "./AnimatedCounter";

/**
 * The prerendered HTML is what a phone paints before hydration, so it has to
 * match the first client render (0) and still carry the real total for
 * assistive tech and crawlers.
 */
function markup(target: number): string {
  return renderToStaticMarkup(<AnimatedCounter target={target} />);
}

describe("AnimatedCounter markup", () => {
  test("counts up from 0, so the prerendered paint matches hydration", () => {
    expect(markup(163_813_446_180)).toContain('aria-hidden="true">0</span>');
  });

  test("keeps the exact final total for screen readers", () => {
    const html = markup(163_813_446_180);
    expect(html).toContain("163,813,446,180");
    expect(html.match(/163,813,446,180/g)).toHaveLength(1);
  });
});
