import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

const photosDataPath = join(import.meta.dir, "..", "public", "photos-data.json");

describe("photos-data.json", () => {
  test("contains the generated gallery dataset", () => {
    const photos = JSON.parse(readFileSync(photosDataPath, "utf-8"));

    expect(Array.isArray(photos)).toBe(true);
    expect(photos.length).toBeGreaterThanOrEqual(50);

    for (const photo of photos) {
      expect(typeof photo.id).toBe("string");
      expect(typeof photo.urls?.regular).toBe("string");
      expect(typeof photo.links?.download_location).toBe("string");
    }
  });
});
