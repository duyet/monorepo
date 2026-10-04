import { describe, expect, it } from "vitest";
import { isExternalHref } from "../src/components.projects/project-href";

describe("isExternalHref", () => {
  it("returns true only when the href starts with http", () => {
    expect(isExternalHref("https://duyet.net")).toBe(true);
    expect(isExternalHref("http://duyet.net")).toBe(true);
    expect(isExternalHref("/projects")).toBe(false);
  });
});
