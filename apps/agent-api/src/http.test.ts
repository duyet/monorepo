import { describe, expect, test } from "vitest";
import type { Env } from "./agent";
import { createHttp } from "./http";

const BASE_ENV = {
  CLERK_AUTHORIZED_PARTIES: "https://agents.duyet.net",
} as unknown as Env;

function request(origin?: string): Request {
  return new Request("https://agents.duyet.net/health", {
    headers: origin ? { Origin: origin } : {},
  });
}

describe("createHttp preflight", () => {
  test("returns 403 for a disallowed Origin", () => {
    const res = createHttp(
      request("https://evil.example.com"),
      BASE_ENV
    ).preflight();

    expect(res.status).toBe(403);
  });

  test("returns 204 with CORS headers for an allowed Origin", () => {
    const res = createHttp(
      request("https://agents.duyet.net"),
      BASE_ENV
    ).preflight();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://agents.duyet.net"
    );
  });

  test("returns 204 when no Origin is sent", () => {
    const res = createHttp(request(), BASE_ENV).preflight();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("createHttp withCors", () => {
  test("echoes an allowed origin and sets the security headers", async () => {
    const res = createHttp(
      request("https://agents.duyet.net"),
      BASE_ENV
    ).withCors(new Response("ok", { status: 200 }));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://agents.duyet.net"
    );
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET,POST,OPTIONS"
    );
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
    expect(res.headers.get("Vary")).toBe("Origin");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
  });

  test("omits Access-Control-Allow-Origin for an unlisted origin", () => {
    const res = createHttp(
      request("https://evil.example.com"),
      BASE_ENV
    ).withCors(new Response("ok", { status: 200 }));

    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  test("passes a 101 upgrade through untouched", () => {
    // The Response constructor rejects 101 in Node, so stub the upgrade shape
    // Workers actually returns from the WebSocket handshake.
    const upgrade = {
      headers: new Headers({ Upgrade: "websocket" }),
      status: 101,
    } as unknown as Response;

    const res = createHttp(
      request("https://agents.duyet.net"),
      BASE_ENV
    ).withCors(upgrade);

    expect(res).toBe(upgrade);
    expect(res.headers.get("Upgrade")).toBe("websocket");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("createHttp withRateLimitHeaders on an upgrade", () => {
  // index.ts composes withCors *then* withRateLimitHeaders on the /agents/
  // route. A WebSocket handshake must survive both steps: rebuilding the
  // Response throws (or, on workerd, silently drops response.webSocket, so the
  // socket never opens). Same contract as withCors: 101 passes through.
  test("passes a 101 upgrade through untouched", () => {
    const upgrade = {
      headers: new Headers({ Upgrade: "websocket" }),
      status: 101,
      webSocket: { readyState: 1 },
    } as unknown as Response;

    const res = createHttp(
      request("https://agents.duyet.net"),
      BASE_ENV
    ).withRateLimitHeaders(
      upgrade,
      new Headers({ "RateLimit-Limit": "30", "RateLimit-Remaining": "29" })
    );

    expect(res).toBe(upgrade);
    expect((res as unknown as { webSocket: unknown }).webSocket).toBeDefined();
    expect(res.headers.get("Upgrade")).toBe("websocket");
  });
});

describe("createHttp json and text", () => {
  test("json sets the JSON content type and status", async () => {
    const res = createHttp(request(), BASE_ENV).json({ ok: true }, 201);

    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(await res.json()).toEqual({ ok: true });
  });

  test("json defaults to 200", async () => {
    const res = createHttp(request(), BASE_ENV).json({ ok: true });

    expect(res.status).toBe(200);
  });

  test("text sets the plain-text content type", async () => {
    const res = createHttp(request(), BASE_ENV).text("hi", 404);

    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("hi");
  });
});

describe("createHttp withRateLimitHeaders", () => {
  test("copies RateLimit headers onto an existing response", async () => {
    const http = createHttp(request(), BASE_ENV);
    const res = http.withRateLimitHeaders(
      http.json({ error: "rate limited" }, 429),
      new Headers({
        "RateLimit-Limit": "30",
        "RateLimit-Remaining": "0",
        "RateLimit-Reset": "60",
        "Retry-After": "60",
      })
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("RateLimit-Limit")).toBe("30");
    expect(res.headers.get("RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("RateLimit-Reset")).toBe("60");
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(await res.json()).toEqual({ error: "rate limited" });
  });
});
