import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { photosDataExitCode } from "../photos-data-result";

const emptyGallery = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "__fixtures__", "empty-gallery.json"),
    "utf-8",
  ),
) as unknown[];

describe("photosDataExitCode", () => {
  test("fails an empty gallery when a token was configured", () => {
    expect(photosDataExitCode(emptyGallery, true)).toBe(1);
  });

  test("keeps the empty-gallery fallback when no token is configured", () => {
    expect(photosDataExitCode(emptyGallery, false)).toBe(0);
  });

  test("accepts a non-empty list when a token is configured", () => {
    expect(photosDataExitCode([{ id: "fixture-photo" }], true)).toBe(0);
  });
});
