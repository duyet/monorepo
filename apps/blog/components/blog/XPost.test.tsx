import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TWEET_EMBED_WRAP_CLASS } from "../../lib/x-embed";
import { Tweet, XPost } from "./XPost";

describe("XPost", () => {
  test("renders a twitter-tweet blockquote from a url", () => {
    const { container } = render(
      <XPost url="https://x.com/_duyet/status/2089665924454633766" />
    );
    const wrap = container.querySelector(
      `.${TWEET_EMBED_WRAP_CLASS.split(" ").join(".")}`
    );
    expect(wrap).not.toBeNull();
    const quote = wrap?.querySelector("blockquote.twitter-tweet");
    expect(quote).not.toBeNull();
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe(
      "https://x.com/_duyet/status/2089665924454633766"
    );
  });

  test("renders from a raw id", () => {
    const { container } = render(<Tweet id="2089665924454633766" />);
    expect(container.querySelector("blockquote.twitter-tweet")).not.toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://x.com/i/web/status/2089665924454633766"
    );
  });

  test("renders nothing without id or url", () => {
    const { container } = render(<XPost />);
    expect(container.querySelector("blockquote")).toBeNull();
  });
});
