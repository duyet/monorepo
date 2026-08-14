import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostHero } from "./-post-hero";
import type { LoadedPost } from "./-types";

const post = {
  title: "Hero test",
  date: "2026-08-01",
  category: "dev",
  thumbnail: "/media/hero.png",
  readingTime: 3,
} as LoadedPost;

describe("PostHero", () => {
  it("reserves width and height on the hero image", () => {
    const { container } = render(<PostHero post={post} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("width")).toBe("1024");
    expect(img?.getAttribute("height")).toBe("576");
    expect(img?.className).toContain("aspect-video");
  });
});
