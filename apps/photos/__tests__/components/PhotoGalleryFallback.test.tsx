import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PhotoGallery from "@/components/PhotoGallery";
import { getFallbackPhotos } from "@/lib/fallback-provider";
import type { Photo } from "@/lib/types";
import photosData from "@/public/photos-data.json";

const readGallery = async (photos: Photo[]) => {
  const { container, unmount } = render(<PhotoGallery photos={photos} />);
  const text = container.textContent ?? "";
  unmount();
  return text;
};

describe("PhotoGallery fallback copy", () => {
  afterEach(cleanup);

  it("labels the built-in sample photos as a fallback, not as a curated collection", async () => {
    const fallback = await getFallbackPhotos();
    const text = await readGallery(fallback);

    expect(text).toContain("sample photos");
    expect(text).toContain("Configure your photo providers");
    // The fallback branch must not also claim the photos came from the
    // providers that just failed.
    expect(text).not.toContain("from Unsplash");
  });

  it("still presents the real dataset as a curated collection", async () => {
    const text = await readGallery(photosData as Photo[]);

    expect(text).toContain("A curated selection of");
    expect(text).not.toContain("sample photos");
  });

  it("does not mistake a real photo whose id matches a sample photo for a fallback", async () => {
    // `3tnmCJNxDeY` is both a real Unsplash id and the first built-in sample.
    // Matching on ids cannot tell the two apart; only an explicit marker can.
    const real: Photo = {
      id: "3tnmCJNxDeY",
      provider: "unsplash",
      created_at: "2025-11-30 17:07:21",
      width: 3009,
      height: 1691,
      urls: {
        raw: "r",
        full: "f",
        regular: "g",
        small: "s",
        thumb: "t",
      },
    };
    const text = await readGallery([real]);

    expect(text).toContain("A curated selection of 1 photos");
    expect(text).not.toContain("sample photos");
  });
});
