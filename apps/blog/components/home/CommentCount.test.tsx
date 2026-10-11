import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CommentCount } from "./CommentCount";

describe("CommentCount", () => {
  test("renders nothing while the total is unknown", () => {
    const { container } = render(<CommentCount />);
    expect(container.innerHTML).toBe("");
  });

  test("renders nothing for a thread with no comments", () => {
    const { container } = render(<CommentCount count={0} />);
    expect(container.innerHTML).toBe("");
  });

  test("shows the total with a readable label", () => {
    const { getByTitle } = render(<CommentCount count={28} />);
    const pill = getByTitle("28 comments");
    expect(pill.textContent).toBe("28");
    // Decorative: the label already carries the meaning.
    expect(pill.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("uses the singular for one comment", () => {
    const { getByTitle } = render(<CommentCount count={1} />);
    expect(getByTitle("1 comment").textContent).toBe("1");
  });
});
