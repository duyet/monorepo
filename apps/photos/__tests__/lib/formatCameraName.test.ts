import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { formatCameraName } from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "camera-name.json"),
    "utf-8",
  ),
) as {
  named: { exif: Photo["exif"]; expected: string };
  makeModel: { exif: Photo["exif"]; expected: string };
};

describe("formatCameraName", () => {
  test("returns the EXIF camera name from the fixture", () => {
    expect(formatCameraName({ exif: fixture.named.exif } as Photo)).toBe(
      fixture.named.expected,
    );
  });

  test("joins make and model when the fixture has no camera name", () => {
    expect(formatCameraName({ exif: fixture.makeModel.exif } as Photo)).toBe(
      fixture.makeModel.expected,
    );
  });

  test("returns null when the photo has no EXIF", () => {
    expect(formatCameraName({} as Photo)).toBeNull();
  });
});
