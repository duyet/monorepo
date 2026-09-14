import { describe, expect, it } from "vitest";
import {
  groupKey,
  groupProjects,
  listingPath,
  matchesQuery,
} from "../src/components.projects/filter-utils";
import type { AppItem } from "../src/data/projects";
import { apps } from "../src/data/projects";

function sample(overrides: Partial<AppItem> = {}): AppItem {
  return {
    name: "AnyRouter",
    href: "https://anyrouter.dev",
    host: "anyrouter.dev",
    utmContent: "test",
    description: "One API for every AI model",
    domain: "anyrouter.dev",
    tags: ["AI", "Infra"],
    ...overrides,
  };
}

describe("project listing helpers", () => {
  it("uses the first tag as the directory group", () => {
    expect(groupKey(sample())).toBe("AI");
    expect(groupKey(sample({ tags: undefined }))).toBe("Other");
  });

  it("lists a short path from the domain", () => {
    expect(listingPath(sample())).toBe("/anyrouter");
    expect(listingPath(sample({ domain: undefined, name: "Share HTML" }))).toBe(
      "/share-html",
    );
  });

  it("groups the catalog in a stable category order", () => {
    const grouped = groupProjects(apps);
    const keys = [...grouped.keys()];
    expect(keys[0]).toBe("AI");
    expect(keys).toContain("Data");
    expect([...grouped.values()].flat()).toHaveLength(apps.length);
  });

  it("matches name, path, and tag queries", () => {
    const item = sample();
    expect(matchesQuery(item, "anyrouter")).toBe(true);
    expect(matchesQuery(item, "infra")).toBe(true);
    expect(matchesQuery(item, "zzzz")).toBe(false);
  });
});
