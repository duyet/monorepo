import { describe, expect, test } from "bun:test";
import type { Profile } from "@duyet/profile";
import type { UrlsConfig } from "./types";
import { createNavigation, createUrls, getAppUrl, getAppUrls } from "./utils";

const baseUrls: UrlsConfig = {
  apps: {
    blog: "https://blog.example.com",
    cv: "https://cv.example.com",
    insights: "https://insights.example.com",
    home: "https://home.example.com",
    photos: "https://photos.example.com",
    homelab: "https://homelab.example.com",
  },
  external: {
    rust: "https://rust.example.com",
    clickhouse: "https://clickhouse.example.com",
    mcp: "https://mcp.example.com",
  },
};

const baseProfile: Profile = {
  personal: {
    name: "Test User",
    shortName: "Test",
    email: "test@example.com",
    title: "Engineer",
    bio: "A test bio",
  },
  social: {
    github: "https://github.com/testuser",
    twitter: "https://twitter.com/testuser",
    linkedin: "https://linkedin.com/in/testuser",
  },
  appearance: {
    theme: {
      primary: "#000000",
      secondary: "#ffffff",
      accent: "#ff0000",
    },
  },
};

describe("createUrls", () => {
  test("returns base unchanged when no overrides provided", () => {
    const result = createUrls(baseUrls);
    expect(result).toEqual(baseUrls);
  });

  test("returns base unchanged when overrides is undefined", () => {
    const result = createUrls(baseUrls, undefined);
    expect(result).toEqual(baseUrls);
  });

  test("deep-merges full app overrides", () => {
    const result = createUrls(baseUrls, {
      apps: {
        blog: "https://myblog.com",
        home: "https://mysite.com",
      },
    });
    expect(result.apps.blog).toBe("https://myblog.com");
    expect(result.apps.home).toBe("https://mysite.com");
    expect(result.apps.cv).toBe("https://cv.example.com");
    expect(result.apps.insights).toBe("https://insights.example.com");
  });

  test("deep-merges partial external overrides without losing other keys", () => {
    const result = createUrls(baseUrls, {
      external: {
        rust: "https://my-rust.com",
      },
    });
    expect(result.external.rust).toBe("https://my-rust.com");
    expect(result.external.clickhouse).toBe("https://clickhouse.example.com");
    expect(result.external.mcp).toBe("https://mcp.example.com");
  });

  test("deep-merges both apps and external simultaneously", () => {
    const result = createUrls(baseUrls, {
      apps: { blog: "https://newblog.com" },
      external: { mcp: "https://newmcp.com" },
    });
    expect(result.apps.blog).toBe("https://newblog.com");
    expect(result.external.mcp).toBe("https://newmcp.com");
    expect(result.apps.cv).toBe("https://cv.example.com");
  });
});

describe("createNavigation", () => {
  test("returns object with main, profile, social, general keys", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    expect(nav).toHaveProperty("main");
    expect(nav).toHaveProperty("profile");
    expect(nav).toHaveProperty("social");
    expect(nav).toHaveProperty("general");
  });

  test("main navigation contains all 5 apps", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    expect(nav.main).toHaveLength(5);
    const names = nav.main.map((l) => l.name);
    expect(names).toContain("Blog");
    expect(names).toContain("CV");
    expect(names).toContain("Insights");
    expect(names).toContain("Photos");
    expect(names).toContain("Homelab");
  });

  test("main navigation hrefs match apps config", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const blog = nav.main.find((l) => l.name === "Blog");
    expect(blog?.href).toBe("https://blog.example.com");
  });

  test("profile navigation has About and Contact links", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    expect(nav.profile).toHaveLength(2);
    const names = nav.profile.map((l) => l.name);
    expect(names).toContain("About");
    expect(names).toContain("Contact");
  });

  test("profile About href is home/about", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const about = nav.profile.find((l) => l.name === "About");
    expect(about?.href).toBe("https://home.example.com/about");
  });

  test("profile Contact href is mailto with profile email", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const contact = nav.profile.find((l) => l.name === "Contact");
    expect(contact?.href).toBe("mailto:test@example.com");
    expect(contact?.external).toBe(true);
  });

  test("social links are filtered to only truthy values", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const names = nav.social.map((l) => l.name);
    expect(names).toContain("GitHub");
    expect(names).toContain("Twitter");
    expect(names).toContain("LinkedIn");
    expect(names).not.toContain("Unsplash");
    expect(names).not.toContain("TikTok");
  });

  test("social links are all marked external", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    for (const link of nav.social) {
      expect(link.external).toBe(true);
    }
  });

  test("social is empty when profile has no social links", () => {
    const profileNoSocial: Profile = {
      ...baseProfile,
      social: {},
    };
    const nav = createNavigation(baseUrls, profileNoSocial);
    expect(nav.social).toHaveLength(0);
  });

  test("general navigation includes external links and blog sub-paths", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const names = nav.general?.map((l) => l.name) ?? [];
    expect(names).toContain("Rust Tiếng Việt");
    expect(names).toContain("ClickHouse Monitoring");
    expect(names).toContain("MCP Tools");
    expect(names).toContain("/ai");
    expect(names).toContain("/data");
  });

  test("general navigation /ai and /data hrefs are blog sub-paths", () => {
    const nav = createNavigation(baseUrls, baseProfile);
    const ai = nav.general?.find((l) => l.name === "/ai");
    const data = nav.general?.find((l) => l.name === "/data");
    expect(ai?.href).toBe("https://blog.example.com/ai");
    expect(data?.href).toBe("https://blog.example.com/data");
  });

  test("general navigation omits missing external URLs", () => {
    const urlsWithoutExternal: UrlsConfig = {
      ...baseUrls,
      external: {},
    };
    const nav = createNavigation(urlsWithoutExternal, baseProfile);
    const names = nav.general?.map((l) => l.name) ?? [];
    expect(names).not.toContain("Rust Tiếng Việt");
    expect(names).not.toContain("ClickHouse Monitoring");
    expect(names).not.toContain("MCP Tools");
    expect(names).toContain("/ai");
    expect(names).toContain("/data");
  });
});

describe("getAppUrls", () => {
  test("returns the apps sub-object from config", () => {
    expect(getAppUrls(baseUrls)).toEqual(baseUrls.apps);
  });
});

describe("getAppUrl", () => {
  test("returns correct URL for each app key", () => {
    const apps = [
      "blog",
      "cv",
      "insights",
      "home",
      "photos",
      "homelab",
    ] as const;
    for (const app of apps) {
      expect(getAppUrl(baseUrls, app)).toBe(baseUrls.apps[app]);
    }
  });
});
