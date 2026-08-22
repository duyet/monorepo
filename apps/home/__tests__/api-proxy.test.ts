import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "../functions/api/[[route]]";

function call(path: string, init?: RequestInit): Promise<Response> {
  return onRequest({ request: new Request(`https://duyet.net${path}`, init) });
}

afterEach(() => vi.unstubAllGlobals());

describe("home /api suffix proxy", () => {
  it("proxies an allowlisted GET to the upstream root with query preserved", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ ok: true }, { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await call("/api/api/ai/percentage/history?months=12");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.duyet.net/api/ai/percentage/history?months=12",
      expect.objectContaining({ method: "GET" })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("maps bare health check to the upstream root", async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await call("/api/health");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.duyet.net/health",
      expect.anything()
    );
  });

  it("forwards Authorization header and JSON body on llm/generate POST", async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: "gen_1" }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await call("/api/api/llm/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: "hello" }),
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer sk-test");
    expect(init.body).toBe(JSON.stringify({ prompt: "hello" }));
    expect(init.method).toBe("POST");
    expect(res.status).toBe(200);
  });

  it("does not forward other inbound headers upstream", async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await call("/api/health", {
      headers: { Cookie: "secret=1", "X-Bad": "1" },
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const headers = init.headers as Headers;
    expect(headers.has("Cookie")).toBe(false);
    expect(headers.has("X-Bad")).toBe(false);
  });

  it("rejects non-allowlisted paths with 404 JSON", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    for (const path of ["/api/api/admin/secret", "/api/../../evil"]) {
      const res = await call(path);
      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "not found" });
    }
    // GET is not allowlisted on the generate endpoint.
    const res = await call("/api/api/llm/generate");
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers OPTIONS preflight with 204 and CORS headers", async () => {
    const res = await call("/api/api/llm/generate", { method: "OPTIONS" });

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
      "Authorization"
    );
  });

  it("returns 502 when the upstream fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("boom");
      })
    );

    const res = await call("/api/health");

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: "upstream unavailable",
    });
  });
});
