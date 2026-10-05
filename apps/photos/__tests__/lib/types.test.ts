import { describe, expect, test } from "vitest";
import { isStandardPhoto, type LocalPhoto, type Photo } from "@/lib/types";

describe("isStandardPhoto", () => {
  test("accepts a provider photo and rejects a local upload", () => {
    const standard = { id: "s", provider: "unsplash" } as Photo;
    const local = { id: "l", source: "local" } as LocalPhoto;

    expect(isStandardPhoto(standard)).toBe(true);
    expect(isStandardPhoto(local)).toBe(false);
  });
});
