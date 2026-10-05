import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { isLocalPhoto } from "@/lib/types";
import type { LocalPhoto, Photo } from "@/lib/types";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "is-local-photo.json"),
    "utf-8"
  )
) as { local: LocalPhoto; standard: Photo };

describe("isLocalPhoto", () => {
  test("returns true for a fixture local photo", () => {
    expect(isLocalPhoto(fixture.local)).toBe(true);
  });

  test("returns false for a fixture provider photo", () => {
    expect(isLocalPhoto(fixture.standard)).toBe(false);
  });
});
