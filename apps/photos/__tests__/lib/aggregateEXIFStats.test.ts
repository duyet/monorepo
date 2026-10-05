import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { aggregateEXIFStats } from "@/lib/exif-stats";
import type { Photo } from "@/lib/types";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "exif-stats.json"),
    "utf-8",
  ),
) as {
  photos: Array<{ exif?: { name: string } }>;
  stats: {
    totalPhotos: number;
    photosWithEXIF: number;
    photosWithoutEXIF: number;
    uniqueCameras: number;
    topCameras: Array<{ camera: string; count: number }>;
  };
};

describe("aggregateEXIFStats", () => {
  test("counts cameras from the fixture and ranks them by use", () => {
    const stats = aggregateEXIFStats(fixture.photos as Photo[]);

    expect(stats.totalPhotos).toBe(fixture.stats.totalPhotos);
    expect(stats.photosWithEXIF).toBe(fixture.stats.photosWithEXIF);
    expect(stats.photosWithoutEXIF).toBe(fixture.stats.photosWithoutEXIF);
    expect(stats.uniqueCameras).toBe(fixture.stats.uniqueCameras);
    expect(stats.topCameras).toEqual([
      { ...fixture.stats.topCameras[0], percentage: 66.66666666666666 },
      { ...fixture.stats.topCameras[1], percentage: 33.33333333333333 },
    ]);
  });
});
