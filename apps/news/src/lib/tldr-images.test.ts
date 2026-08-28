import { describe, expect, it } from "vitest";
import {
  attachTldrBulletImages,
  collectTldrItemIds,
  imageUrlByItemId,
  withTldrImages,
} from "./tldr-images";

describe("imageUrlByItemId", () => {
  it("keeps only non-empty image URLs", () => {
    const map = imageUrlByItemId([
      { id: "a", image_url: "https://img.example/a.jpg" },
      { id: "b", image_url: null },
      { id: "c", image_url: "" },
      { id: "d" },
    ]);
    expect([...map.entries()]).toEqual([["a", "https://img.example/a.jpg"]]);
  });
});

describe("collectTldrItemIds", () => {
  it("unions item_ids from both languages without duplicates", () => {
    expect(
      collectTldrItemIds({
        bullets_en: [
          { text: "A", item_ids: ["a"] },
          { text: "B", item_ids: ["b", "c"] },
        ],
        bullets_vi: [{ text: "A vi", item_ids: ["a"] }, { text: "orphan" }],
      }).sort()
    ).toEqual(["a", "b", "c"]);
  });

  it("returns empty for a missing snapshot", () => {
    expect(collectTldrItemIds(null)).toEqual([]);
  });
});

describe("attachTldrBulletImages", () => {
  const images = new Map([
    ["a", "https://img.example/a.jpg"],
    ["c", "https://img.example/c.jpg"],
  ]);

  it("copies the first linked story image and leaves others unchanged", () => {
    expect(
      attachTldrBulletImages(
        [
          { text: "Has image", item_ids: ["a"] },
          { text: "No image", item_ids: ["b"] },
          { text: "Cluster", item_ids: ["b", "c"] },
          {
            text: "Already set",
            item_ids: ["a"],
            image_url: "https://keep.me/x.png",
          },
          { text: "No ids" },
        ],
        images
      )
    ).toEqual([
      {
        text: "Has image",
        item_ids: ["a"],
        image_url: "https://img.example/a.jpg",
      },
      { text: "No image", item_ids: ["b"] },
      {
        text: "Cluster",
        item_ids: ["b", "c"],
        image_url: "https://img.example/c.jpg",
      },
      {
        text: "Already set",
        item_ids: ["a"],
        image_url: "https://keep.me/x.png",
      },
      { text: "No ids" },
    ]);
  });
});

describe("withTldrImages", () => {
  it("attaches images on both languages without mutating the input", () => {
    const tldr = {
      date: "2026-08-27",
      bullets_en: [{ text: "EN", item_ids: ["a"] }],
      bullets_vi: [{ text: "VI", item_ids: ["a"] }],
    };
    const out = withTldrImages(
      tldr,
      new Map([["a", "https://img.example/a.jpg"]])
    );
    expect(out?.bullets_en[0]?.image_url).toBe("https://img.example/a.jpg");
    expect(out?.bullets_vi[0]?.image_url).toBe("https://img.example/a.jpg");
    expect(tldr.bullets_en[0]).not.toHaveProperty("image_url");
  });

  it("passes null through", () => {
    expect(withTldrImages(null, new Map())).toBeNull();
  });
});
