import { describe, expect, it } from "vitest";
import { timeAgo } from "./lang";

describe("timeAgo", () => {
  const now = 1_700_000_000_000;

  it("formats seconds input", () => {
    expect(timeAgo(now / 1000 - 90, now, "en")).toBe("1m ago");
    expect(timeAgo(now / 1000 - 7200, now, "en")).toBe("2h ago");
    expect(timeAgo(now / 1000 - 86400 * 3, now, "en")).toBe("3d ago");
  });

  it("normalizes millisecond epoch input", () => {
    const secAgo = now / 1000 - 120;
    expect(timeAgo(secAgo * 1000, now, "en")).toBe("2m ago");
  });

  it("formats Vietnamese branches", () => {
    expect(timeAgo(now / 1000 - 1800, now, "vi")).toBe("30 phút trước");
    expect(timeAgo(now / 1000 - 7200, now, "vi")).toBe("2 giờ trước");
    expect(timeAgo(now / 1000 - 86400, now, "vi")).toBe("1 ngày trước");
  });
});
