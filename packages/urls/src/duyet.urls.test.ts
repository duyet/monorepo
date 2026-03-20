import { describe, expect, test } from "bun:test";
// duyetUrls evaluates env at module load time, so we test the shape
// and hardcoded fallbacks directly from the cached module.
import { duyetUrls } from "./duyet.urls";

describe("duyetUrls", () => {
  test("has apps sub-object", () => {
    expect(duyetUrls).toHaveProperty("apps");
  });

  test("has external sub-object", () => {
    expect(duyetUrls).toHaveProperty("external");
  });

  test("apps object has all expected keys", () => {
    const { apps } = duyetUrls;
    expect(apps).toHaveProperty("blog");
    expect(apps).toHaveProperty("cv");
    expect(apps).toHaveProperty("insights");
    expect(apps).toHaveProperty("home");
    expect(apps).toHaveProperty("photos");
    expect(apps).toHaveProperty("homelab");
  });

  test("all app URLs are valid absolute URLs", () => {
    for (const value of Object.values(duyetUrls.apps)) {
      expect(typeof value).toBe("string");
      expect(() => new URL(value)).not.toThrow();
    }
  });

  test("external rust URL is set", () => {
    expect(duyetUrls.external.rust).toBe("https://rust-tieng-viet.github.io");
  });

  test("external clickhouse URL is set", () => {
    expect(duyetUrls.external.clickhouse).toBe(
      "https://clickhouse.duyet.net"
    );
  });

  test("external mcp URL is set", () => {
    expect(duyetUrls.external.mcp).toBe("https://mcp.duyet.net");
  });

  test("external monica URL is a valid URL", () => {
    expect(duyetUrls.external.monica).toMatch(/^https?:\/\//);
  });

  test("external googleScript URL is a valid URL", () => {
    expect(duyetUrls.external.googleScript).toMatch(/^https?:\/\//);
  });
});

describe("duyetUrls navigation via createNavigation", () => {
  test("produces valid navigation from duyetUrls", async () => {
    const { createNavigation } = await import("./utils");
    const profile = {
      personal: {
        name: "Duyet",
        shortName: "Duyet",
        email: "me@duyet.net",
        title: "Engineer",
        bio: "bio",
      },
      social: { github: "https://github.com/duyet" },
      appearance: {
        theme: { primary: "#000", secondary: "#fff", accent: "#f00" },
      },
    };

    const nav = createNavigation(duyetUrls, profile);
    expect(nav.main.length).toBeGreaterThan(0);
    expect(nav.profile.length).toBeGreaterThan(0);
    expect(nav.social.length).toBeGreaterThan(0);
    expect(nav.social.find((l) => l.name === "GitHub")?.href).toBe(
      "https://github.com/duyet"
    );
  });
});
