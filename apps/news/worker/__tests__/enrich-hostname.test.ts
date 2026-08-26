import { describe, expect, it, vi } from "vitest";
import { isFetchableUrl } from "../enrich.js";

describe("isFetchableUrl", () => {
  it.each([
    ["https://example.com/article", true],
    ["http://news.ycombinator.com/item", true],
    ["http://localhost/admin", false],
    ["http://127.0.0.1/", false],
    ["http://10.0.0.1/", false],
    ["http://192.168.1.1/", false],
    ["http://172.16.0.1/", false],
    ["http://169.254.169.254/", false],
    ["http://foo.internal/", false],
    ["http://host.local/", false],
    ["ftp://example.com/", false],
    ["not-a-url", false],
  ])("%s -> %s", (url, expected) => {
    expect(isFetchableUrl(url)).toBe(expected);
  });

  it("blocks fetch for disallowed URLs", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { fetchOgData } = await import("../enrich.js");
    await fetchOgData("http://127.0.0.1/secret");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
