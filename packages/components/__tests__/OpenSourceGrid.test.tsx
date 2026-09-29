import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type Repo, OpenSourceGrid } from "../OpenSourceGrid";

const repo = (name: string, stars: number): Repo => ({
  name,
  description: null,
  stars,
  forks: 0,
  watchers: 0,
  language: "TypeScript",
  license: "MIT",
  updatedAt: "2026-01-01T00:00:00Z",
});

// Covers the migration off the local `formatStars` copy onto the shared
// @duyet/libs helper. The shared helper's own boundaries are asserted in
// packages/libs/__tests__/formatNumber.test.ts; what matters here is that the
// grid renders the helper's lowercase k/m/b output rather than a private copy.
describe("OpenSourceGrid star formatting", () => {
  it("renders sub-1000 star counts unformatted", () => {
    const { container } = render(
      <OpenSourceGrid repos={[repo("tiny", 999)]} user="duyet" />
    );
    expect(container.textContent).toContain("999");
  });

  it("renders 1,500 stars as 1.5k", () => {
    const { container } = render(
      <OpenSourceGrid repos={[repo("mid", 1500)]} user="duyet" />
    );
    expect(container.textContent).toContain("1.5k");
  });

  it("renders the summed total with the same helper", () => {
    const { container } = render(
      <OpenSourceGrid
        repos={[repo("a", 1500), repo("b", 2000)]}
        user="duyet"
      />
    );
    // 1500 + 2000 = 3500 -> "3.5k total stars"
    expect(container.textContent).toContain("3.5k total stars");
  });

  it("picks the m tier for a total that exceeds 999k", () => {
    // The old `formatStars` only knew about `k`, so this aggregate used to
    // render "1000.0k". Regression cover for the accidental tier gap.
    const { container } = render(
      <OpenSourceGrid repos={[repo("big", 1_000_000)]} user="duyet" />
    );
    expect(container.textContent).toContain("1.0m total stars");
  });
});
