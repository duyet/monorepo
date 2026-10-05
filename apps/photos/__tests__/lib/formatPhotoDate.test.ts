import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { formatPhotoDate } from "@/lib/MetadataFormatters";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "photo-date.json"),
    "utf-8",
  ),
) as { createdAt: string; formatted: string };

describe("formatPhotoDate", () => {
  test("formats a fixture timestamp as a long en-US date", () => {
    expect(formatPhotoDate(fixture.createdAt)).toBe(fixture.formatted);
  });
});
