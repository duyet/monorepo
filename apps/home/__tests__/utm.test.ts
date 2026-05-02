import { describe, expect, it } from "bun:test";
import { addUtmParams } from "../app/lib/utm";

describe("addUtmParams", () => {
  it("adds utm params to absolute URL", () => {
    const result = addUtmParams("https://blog.duyet.net");
    expect(result).toContain("utm_source=home");
    expect(result).toContain("utm_medium=website");
    expect(result).toContain("utm_campaign=homepage");
  });

  it("uses custom campaign", () => {
    const result = addUtmParams("https://blog.duyet.net", "custom");
    expect(result).toContain("utm_campaign=custom");
  });

  it("adds utm_content when provided", () => {
    const result = addUtmParams(
      "https://blog.duyet.net",
      "homepage",
      "blog_bento"
    );
    expect(result).toContain("utm_content=blog_bento");
  });

  it("does not add utm_content when not provided", () => {
    const result = addUtmParams("https://blog.duyet.net");
    expect(result).not.toContain("utm_content");
  });

  it("converts relative path to absolute when host provided", () => {
    const result = addUtmParams("/", "homepage", "test", "blog.duyet.net");
    expect(result).toContain("https://blog.duyet.net/");
    expect(result).toContain("utm_source=home");
  });

  it("preserves relative path when host provided", () => {
    const result = addUtmParams(
      "/agents",
      "homepage",
      "agents_bento",
      "agents.duyet.net"
    );
    expect(result).toContain("https://agents.duyet.net/agents");
    expect(result).toContain("utm_content=agents_bento");
  });

  it("returns relative path unchanged when no host", () => {
    const result = addUtmParams("/about");
    expect(result).toBe("/about");
  });

  it("preserves existing query params", () => {
    const result = addUtmParams("https://blog.duyet.net?foo=bar");
    expect(result).toContain("foo=bar");
    expect(result).toContain("utm_source=home");
  });
});
