import { describe, expect, test } from "bun:test";
import { GET, dynamic } from "../route";

describe("Ping Route", () => {
  test("should return ok status", async () => {
    const response = GET();
    const data = await response.json();

    expect(data).toEqual({ status: "ok" });
  });

  test("should be force-static", () => {
    expect(dynamic).toBe("force-static");
  });

  test("should have cache headers", () => {
    const response = GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toBe("public, max-age=3600, s-maxage=3600");
  });

  test("should export GET as a function", () => {
    expect(typeof GET).toBe("function");
  });
});
