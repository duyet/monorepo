import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "../functions/_middleware";

const html = `<!doctype html><html><head></head><body><main>hi</main></body></html>`;

function htmlResponse(): Response {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("home _middleware", () => {
  it("adds Vary to the HTML response so caches vary on Accept", async () => {
    const res = await onRequest({
      request: new Request("https://duyet.net/"),
      next: async () => htmlResponse(),
    });
    expect(res.headers.get("Vary")).toContain("Accept");
  });

  it("preserves existing Vary values on the HTML response", async () => {
    const res = await onRequest({
      request: new Request("https://duyet.net/"),
      next: async () =>
        new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html", Vary: "User-Agent" },
        }),
    });
    expect(res.headers.get("Vary")).toBe("User-Agent, Accept, Accept-Encoding");
  });

  it("serves llms.txt as text/markdown with Vary: Accept, Accept-Encoding", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response("# Site index\n- /projects", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await onRequest({
      request: new Request("https://duyet.net/", {
        headers: { Accept: "text/markdown" },
      }),
      next: async () => htmlResponse(),
    });

    // The middleware fetches /llms.txt from its own origin.
    expect(fetchMock).toHaveBeenCalledWith("https://duyet.net/llms.txt");
    expect(res.headers.get("Content-Type")).toContain("text/markdown");
    expect(res.headers.get("Vary")).toBe("Accept, Accept-Encoding");
    expect(res.headers.get("Link")).toContain("api-catalog");
  });

  it("falls back to HTML when llms.txt is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 404 }))
    );

    const res = await onRequest({
      request: new Request("https://duyet.net/", {
        headers: { Accept: "text/markdown" },
      }),
      next: async () => htmlResponse(),
    });

    expect(res.headers.get("Content-Type")).toContain("text/html");
  });
});
