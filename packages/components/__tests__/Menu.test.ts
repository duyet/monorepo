import { describe, expect, vi, test } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: () => null,
}));

const { HOME, createDefaultNavigation } = await import("../Menu");

type NavigationItem = {
  name: string;
  href: string;
};

describe("HOME constant", () => {
  test("has name 'Home'", () => {
    expect(HOME.name).toBe("Home");
  });

  test("has a non-empty href", () => {
    expect(typeof HOME.href).toBe("string");
    expect(HOME.href.length).toBeGreaterThan(0);
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
    expect(items.length).toBe(5);
  });

  test("first item is Home", () => {
    const items = createDefaultNavigation(mockUrls);
    const first = items[0];
    expect(first.name).toBe("Home");
    expect(typeof first.href).toBe("string");
    expect(first.href.length).toBeGreaterThan(0);
  });

  test("includes About with URL from urls.apps.home", () => {
    const items = createDefaultNavigation(mockUrls);
    const about = items.find((item: NavigationItem) => item.name === "About");
    expect(about).toBeDefined();
    expect(about?.href).toBe(`${mockUrls.apps.home}/about`);
  });

  test("includes Photos with URL from urls.apps.photos", () => {
    const items = createDefaultNavigation(mockUrls);
    const photos = items.find((item: NavigationItem) => item.name === "Photos");
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
});
