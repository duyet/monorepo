import { describe, expect, it } from "bun:test";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
  type Category,
} from "../app/config/categories";

describe("CATEGORY_ORDER", () => {
  it("contains exactly 4 categories", () => {
    expect(CATEGORY_ORDER).toHaveLength(4);
  });

  it("contains Apps, Social, Tools, Other", () => {
    expect(CATEGORY_ORDER).toContain("Apps");
    expect(CATEGORY_ORDER).toContain("Social");
    expect(CATEGORY_ORDER).toContain("Tools");
    expect(CATEGORY_ORDER).toContain("Other");
  });
});

describe("CATEGORY_MAP", () => {
  it("maps /blog to Apps", () => {
    expect(CATEGORY_MAP["/blog"]).toBe("Apps");
  });

  it("maps /github to Social", () => {
    expect(CATEGORY_MAP["/github"]).toBe("Social");
  });

  it("maps /in (LinkedIn) to Social", () => {
    expect(CATEGORY_MAP["/in"]).toBe("Social");
  });

  it("maps /rust to Tools", () => {
    expect(CATEGORY_MAP["/rust"]).toBe("Tools");
  });

  it("maps /clickhouse-monitoring to Tools", () => {
    expect(CATEGORY_MAP["/clickhouse-monitoring"]).toBe("Tools");
  });

  it("maps /insights to Apps", () => {
    expect(CATEGORY_MAP["/insights"]).toBe("Apps");
  });

  it("maps /photos to Apps", () => {
    expect(CATEGORY_MAP["/photos"]).toBe("Apps");
  });

  it("all values are valid categories from CATEGORY_ORDER", () => {
    for (const [_path, category] of Object.entries(CATEGORY_MAP)) {
      expect(CATEGORY_ORDER).toContain(category as Category);
    }
  });

  it("does not return Other for any explicitly mapped path", () => {
    // All entries in CATEGORY_MAP should be explicitly mapped — none should be Other
    // (Other is the default for unmapped paths, not stored in the map itself)
    for (const category of Object.values(CATEGORY_MAP)) {
      expect(category).not.toBe("Other");
    }
  });
});

describe("DEFAULT_CATEGORY", () => {
  it('is "Other"', () => {
    expect(DEFAULT_CATEGORY).toBe("Other");
  });

  it("is a valid category in CATEGORY_ORDER", () => {
    expect(CATEGORY_ORDER).toContain(DEFAULT_CATEGORY);
  });
});
