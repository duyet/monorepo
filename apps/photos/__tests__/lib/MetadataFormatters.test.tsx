import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PhotoFeed from "@/components/PhotoFeed";
import { toIsoTimestamp } from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";
import photosData from "@/public/photos-data.json";

/** True only for a canonical UTC ISO 8601 instant, e.g. 2025-11-30T17:07:21.000Z */
const isCanonicalIso = (value: string) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString() === value;
};

const photos = photosData as Photo[];

describe("toIsoTimestamp", () => {
  it("reads the provider's zone-less UTC timestamps as UTC, not as local time", () => {
    // The syncer stores UTC and strips the "Z" from the ClickHouse DateTime64.
    // V8 would otherwise read this as 17:07 local and shift it by the offset.
    expect(toIsoTimestamp("2025-11-30 17:07:21")).toBe(
      "2025-11-30T17:07:21.000Z"
    );
  });

  it("leaves an already-ISO timestamp alone", () => {
    expect(toIsoTimestamp("2025-01-15T10:00:00Z")).toBe(
      "2025-01-15T10:00:00.000Z"
    );
  });

  it("normalises an offset timestamp to UTC", () => {
    expect(toIsoTimestamp("2025-01-15T10:00:00+07:00")).toBe(
      "2025-01-15T03:00:00.000Z"
    );
  });

  it("passes an unparseable value through rather than inventing a date", () => {
    expect(toIsoTimestamp("not a date")).toBe("not a date");
  });

  it("produces a canonical ISO 8601 instant for every shipped photo", () => {
    const bad = photos
      .map((p) => p.created_at)
      .filter((raw) => !isCanonicalIso(toIsoTimestamp(raw)));
    expect(bad).toEqual([]);
  });
});

describe("PhotoFeed datePublished metadata", () => {
  afterEach(cleanup);

  it("emits schema.org-parseable datePublished for every photo", () => {
    const { container, unmount } = render(<PhotoFeed photos={photos} />);
    const values = Array.from(
      container.querySelectorAll('meta[itemprop="datePublished"]')
    ).map((m) => m.getAttribute("content") ?? "");
    unmount();

    expect(values).toHaveLength(photos.length);
    const bad = values.filter((v) => !isCanonicalIso(v));
    expect(bad).toEqual([]);
  });
});
