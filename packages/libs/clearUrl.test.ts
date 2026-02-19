import { expect, test } from "bun:test";
import { clearUrl } from "./clearUrl";

test("clearUrl()", () => {
  expect(clearUrl("https://duyet.net")).toBe("https://duyet.net");
  expect(clearUrl("https://duyet.net/")).toBe("https://duyet.net");
  expect(clearUrl("https://duyet.net///")).toBe("https://duyet.net");

  expect(clearUrl("https://duyet.net/a")).toBe("https://duyet.net/a");
  expect(clearUrl("https://duyet.net//a")).toBe("https://duyet.net/a");
  expect(clearUrl("https://duyet.net/a/")).toBe("https://duyet.net/a");
});

test("clearUrl() to remove params", () => {
  expect(clearUrl("https://duyet.net/a?")).toBe("https://duyet.net/a");
  expect(clearUrl("https://duyet.net/a?k=v")).toBe("https://duyet.net/a");
});

test("clearUrl() with invalid URL", () => {
  expect(() => clearUrl("https://   duyet.net")).toThrow("Invalid URL");
});
