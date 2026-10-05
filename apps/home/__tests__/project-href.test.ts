import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  isExternalHref,
  projectHref,
} from "../src/components.projects/project-href";
import type { AppItem } from "../src/data/projects";

const fixture = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "fixtures", "project-href.json"),
    "utf-8",
  ),
) as { item: AppItem; href: string };

describe("isExternalHref", () => {
  it("returns true only when the href starts with http", () => {
    expect(isExternalHref("https://duyet.net")).toBe(true);
    expect(isExternalHref("http://duyet.net")).toBe(true);
    expect(isExternalHref("/projects")).toBe(false);
  });
});

describe("projectHref", () => {
  it("adds the projects campaign to the fixture link", () => {
    expect(projectHref(fixture.item)).toBe(fixture.href);
  });
});
