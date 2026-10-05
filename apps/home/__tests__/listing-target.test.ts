import { describe, expect, test } from "vitest";
import { listingTarget } from "../src/components.projects/filter-utils";
import type { AppItem } from "../src/data/projects";

const item = {
  name: "Blog",
  href: "https://blog.duyet.net/posts?utm=home",
  host: "blog.duyet.net",
  utmContent: "blog",
  description: "Notes",
} satisfies AppItem;

describe("listingTarget", () => {
  test("uses the production domain, otherwise the href without a query", () => {
    expect(listingTarget({ ...item, domain: "blog.duyet.net" })).toBe(
      "https://blog.duyet.net",
    );
    expect(listingTarget(item)).toBe("https://blog.duyet.net/posts");
  });
});
