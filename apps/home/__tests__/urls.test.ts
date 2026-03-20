import { describe, expect, it } from "bun:test";
import { getPublicUrls, getTarget, urls } from "../app/config/urls";

describe("urls", () => {
  it("has expected keys", () => {
    const keys = Object.keys(urls);
    expect(keys).toContain("/blog");
    expect(keys).toContain("/github");
    expect(keys).toContain("/ls");
    expect(keys).toContain("/ping");
    expect(keys).toContain("/health");
    expect(keys).toContain("/llms.txt");
  });
});

describe("getTarget", () => {
  it("returns correct target for string entries", () => {
    expect(getTarget("/blog")).toBe("https://blog.duyet.net");
    expect(getTarget("/")).toBe("https://duyet.net");
  });

  it("returns correct target for object entries", () => {
    expect(getTarget("/ai")).toBe("https://ai.duyet.net");
    expect(getTarget("/github")).toBe("https://github.com/duyet");
    expect(getTarget("/insights")).toBe("https://insights.duyet.net");
  });

  it("returns null for non-existent paths", () => {
    expect(getTarget("/does-not-exist")).toBeNull();
    expect(getTarget("")).toBeNull();
    expect(getTarget("/nonexistent-path-xyz")).toBeNull();
  });

  it("returns target for system URLs", () => {
    expect(getTarget("/ls")).toBe("/ls");
    expect(getTarget("/ping")).toBe("/ping");
  });
});

describe("getPublicUrls", () => {
  it("returns an array", () => {
    const result = getPublicUrls();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("excludes system URLs", () => {
    const result = getPublicUrls();
    const paths = result.map((u) => u.path);
    expect(paths).not.toContain("/ls");
    expect(paths).not.toContain("/ping");
    expect(paths).not.toContain("/health");
    expect(paths).not.toContain("/llms.txt");
  });

  it("returns objects with path and target", () => {
    const result = getPublicUrls();
    for (const item of result) {
      expect(typeof item.path).toBe("string");
      expect(typeof item.target).toBe("string");
    }
  });

  it("includes optional desc field for object entries", () => {
    const result = getPublicUrls();
    const blogEntry = result.find((u) => u.path === "/blog");
    // /blog is a plain string entry — desc should be undefined
    expect(blogEntry).toBeDefined();
    expect(blogEntry?.desc).toBeUndefined();

    const aiEntry = result.find((u) => u.path === "/ai");
    expect(aiEntry).toBeDefined();
    expect(aiEntry?.desc).toBe("AI chatbot");
  });

  it("includes /blog with correct target", () => {
    const result = getPublicUrls();
    const blogEntry = result.find((u) => u.path === "/blog");
    expect(blogEntry?.target).toBe("https://blog.duyet.net");
  });

  it("includes /github with correct target and desc", () => {
    const result = getPublicUrls();
    const githubEntry = result.find((u) => u.path === "/github");
    expect(githubEntry?.target).toBe("https://github.com/duyet");
    expect(githubEntry?.desc).toBe("@duyet on Github");
  });
});
