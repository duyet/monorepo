import { describe, expect, test } from "bun:test";
import { HOME, createDefaultNavigation } from "../Menu";
import type { NavigationItem } from "../Menu";

describe("HOME constant", () => {
  test("has name 'Home'", () => {
    expect(HOME.name).toBe("Home");
  });

  test("has href '/' (relative root path, not an external URL)", () => {
    expect(HOME.href).toBe("/");
  });

  test("does not point to an external domain", () => {
    expect(HOME.href.startsWith("http")).toBe(false);
  });
});

describe("createDefaultNavigation", () => {
  const mockUrls = {
    apps: {
      home: "https://duyet.net",
      blog: "https://blog.duyet.net",
      photos: "https://photos.duyet.net",
      insights: "https://insights.duyet.net",
      cv: "https://cv.duyet.net",
    },
  } as Parameters<typeof createDefaultNavigation>[0];

  test("returns an array of NavigationItem objects", () => {
    const items = createDefaultNavigation(mockUrls);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  test("first item is HOME with href '/'", () => {
    const items = createDefaultNavigation(mockUrls);
    const first = items[0];
    expect(first.name).toBe("Home");
    expect(first.href).toBe("/");
  });

  test("first item matches the HOME constant exactly", () => {
    const items = createDefaultNavigation(mockUrls);
    expect(items[0]).toEqual(HOME);
  });

  test("includes About with URL from urls.apps.home", () => {
    const items = createDefaultNavigation(mockUrls);
    const about = items.find((i: NavigationItem) => i.name === "About");
    expect(about).toBeDefined();
    expect(about?.href).toBe(`${mockUrls.apps.home}/about`);
  });

  test("includes Photos with URL from urls.apps.photos", () => {
    const items = createDefaultNavigation(mockUrls);
    const photos = items.find((i: NavigationItem) => i.name === "Photos");
    expect(photos).toBeDefined();
    expect(photos?.href).toBe(mockUrls.apps.photos);
  });

  test("all items have non-empty name and href", () => {
    const items = createDefaultNavigation(mockUrls);
    for (const item of items) {
      expect(typeof item.name).toBe("string");
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.href).toBe("string");
      expect(item.href.length).toBeGreaterThan(0);
    }
  });

  test("Home item href is not affected by the urls argument", () => {
    const urlsA = { ...mockUrls, apps: { ...mockUrls.apps, home: "https://a.example.com" } };
    const urlsB = { ...mockUrls, apps: { ...mockUrls.apps, home: "https://b.example.com" } };
    const itemsA = createDefaultNavigation(urlsA);
    const itemsB = createDefaultNavigation(urlsB);
    // Both should have href "/"  regardless of urls.apps.home
    expect(itemsA[0].href).toBe("/");
    expect(itemsB[0].href).toBe("/");
  });
});