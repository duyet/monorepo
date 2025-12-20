/**
 * Tests for shared Next.js route handlers
 */

import { NextResponse } from "next/server";
import { createPingRoute, createLlmsTxtRoute } from "../next-routes";

describe("createPingRoute", () => {
  it("should create a ping route with GET handler", () => {
    const route = createPingRoute();

    expect(route.GET).toBeDefined();
    expect(typeof route.GET).toBe("function");
  });

  it("should return ok status", async () => {
    const route = createPingRoute();
    const response = route.GET();

    expect(response).toBeInstanceOf(NextResponse);

    const data = await response.json();
    expect(data).toEqual({ status: "ok" });
  });

  it("should have cache headers", () => {
    const route = createPingRoute();
    const response = route.GET();

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toBe("public, max-age=3600, s-maxage=3600");
  });

  it("should be force-static", () => {
    const route = createPingRoute();
    expect(route.dynamic).toBe("force-static");
  });
});

describe("createLlmsTxtRoute", () => {
  it("should create a route with GET handler", () => {
    const route = createLlmsTxtRoute("Test content");

    expect(route.GET).toBeDefined();
    expect(typeof route.GET).toBe("function");
  });

  it("should return provided content", async () => {
    const content = "# My App\nThis is a test";
    const route = createLlmsTxtRoute(content);
    const response = route.GET();

    expect(response).toBeInstanceOf(NextResponse);

    const text = await response.text();
    expect(text).toBe(content);
  });

  it("should trim whitespace from content", async () => {
    const content = "\n\n  # My App  \n\n";
    const route = createLlmsTxtRoute(content);
    const response = route.GET();

    const text = await response.text();
    expect(text).toBe("# My App");
  });

  it("should have correct content type", () => {
    const route = createLlmsTxtRoute("Test");
    const response = route.GET();

    const contentType = response.headers.get("Content-Type");
    expect(contentType).toBe("text/plain; charset=utf-8");
  });

  it("should have default cache headers", () => {
    const route = createLlmsTxtRoute("Test");
    const response = route.GET();

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toBe("public, max-age=3600, s-maxage=3600");
  });

  it("should allow custom cache max age", () => {
    const route = createLlmsTxtRoute("Test", { cacheMaxAge: 7200 });
    const response = route.GET();

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toBe("public, max-age=7200, s-maxage=7200");
  });

  it("should be force-static", () => {
    const route = createLlmsTxtRoute("Test");
    expect(route.dynamic).toBe("force-static");
  });

  it("should handle empty content", async () => {
    const route = createLlmsTxtRoute("");
    const response = route.GET();

    const text = await response.text();
    expect(text).toBe("");
  });

  it("should handle multiline content", async () => {
    const content = `Line 1
Line 2
Line 3`;
    const route = createLlmsTxtRoute(content);
    const response = route.GET();

    const text = await response.text();
    expect(text).toBe(content);
  });
});
