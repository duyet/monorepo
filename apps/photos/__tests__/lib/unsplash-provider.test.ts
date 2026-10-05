import { describe, expect, test } from "vitest";
import type { UnsplashPhoto } from "@/lib/types";
import { unsplashToPhoto } from "@/lib/unsplash-provider";

const unsplashPhoto = {
  id: "abc",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  width: 100,
  height: 80,
  color: "#ffffff",
  blur_hash: "L00",
  description: "A door",
  alt_description: "door",
  urls: { raw: "r", full: "f", regular: "reg", small: "s", thumb: "t" },
  links: {
    self: "self",
    html: "html",
    download: "dl",
    download_location: "dll",
  },
  likes: 3,
  user: {
    id: "u1",
    username: "duyet",
    name: "Duyet",
    profile_image: { small: "sm", medium: "md", large: "lg" },
  },
} as UnsplashPhoto;

describe("unsplashToPhoto", () => {
  test("maps a small Unsplash photo onto the generic photo", () => {
    expect(unsplashToPhoto(unsplashPhoto)).toEqual({
      id: "abc",
      provider: "unsplash",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      width: 100,
      height: 80,
      color: "#ffffff",
      blur_hash: "L00",
      description: "A door",
      alt_description: "door",
      urls: { raw: "r", full: "f", regular: "reg", small: "s", thumb: "t" },
      links: {
        self: "self",
        html: "html",
        download: "dl",
        download_location: "dll",
      },
      likes: 3,
      stats: undefined,
      location: undefined,
      exif: undefined,
      user: {
        id: "u1",
        username: "duyet",
        name: "Duyet",
        profile_image: { small: "sm", medium: "md", large: "lg" },
      },
      originalData: unsplashPhoto,
    });
  });
});
