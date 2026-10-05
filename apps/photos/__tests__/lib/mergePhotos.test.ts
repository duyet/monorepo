import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { mergePhotos } from "@/lib/localPhotos";
import type { LocalPhoto } from "@/lib/types";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "merge-photos.json"),
    "utf-8",
  ),
) as {
  unsplash: Array<{ id: string; created_at: string; source: string }>;
  local: Array<{ id: string; created_at: string; source: "local" }>;
  order: string[];
};

describe("mergePhotos", () => {
  test("merges the fixture and sorts newest created_at first", () => {
    const merged = mergePhotos(
      fixture.unsplash,
      fixture.local as LocalPhoto[],
    );

    expect(merged.map((photo) => photo.id)).toEqual(fixture.order);
  });
});
