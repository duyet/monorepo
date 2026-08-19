import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostHero } from "./-post-hero";
import type { LoadedPost } from "./-types";

const post: LoadedPost = {
  slug: "2026/08/hero-test",
  title: "Hero test",
  date: new Date("2026-08-01"),
  category: "dev",
  category_slug: "dev",
  tags: [],
  tags_slug: [],
  featured: false,
  thumbnail: "/media/hero.png",
  readingTime: 3,
};

describe("PostHero", () => {
  it("reserves width and height on the hero image", () => {
    const { container } = render(<PostHero post={post} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("width")).toBe("1024");
    expect(img?.getAttribute("height")).toBe("576");
    expect(img?.className).toContain("aspect-video");
  });

  it("renders a looping muted video instead of an image when post.video is set", () => {
    const { container } = render(
      <PostHero post={{ ...post, video: "/media/hero.mp4" }} />
    );
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("src")).toBe("/media/hero.mp4");
    expect(video?.getAttribute("poster")).toBe("/media/hero.png");
    expect(video?.hasAttribute("autoplay")).toBe(true);
    expect(video?.hasAttribute("loop")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect((video as HTMLVideoElement | null)?.muted).toBe(true);
    expect(video?.className).toContain("w-[92vw]");
    expect(video?.className).toContain("max-w-[1024px]");
    expect(video?.className).toContain("rounded");
    expect(container.querySelector("img")).toBeNull();
  });
});
