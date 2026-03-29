import { expect, test } from "bun:test";
import { createUrls, createNavigation, getAppUrls, getAppUrl } from "./utils";
import { duyetUrls } from "./duyet.urls";
import type { UrlsConfig, Navigation } from "./types";
import type { PersonalInfo, Profile } from "@duyet/profile";

test("createUrls() returns base when no overrides", () => {
  const result = createUrls(duyetUrls);
  expect(result).toEqual(duyetUrls);
});

test("createUrls() merges overrides correctly", () => {
  const overrides = {
    apps: {
      blog: "https://custom.blog",
    },
  };

  const result = createUrls(duyetUrls, overrides);
  expect(result.apps.blog).toBe("https://custom.blog");
  expect(result.apps.home).toBe(duyetUrls.apps.home);
});

test("createUrls() merges nested overrides", () => {
  const overrides = {
    external: {
      customLink: "https://example.com",
    },
  };

  const result = createUrls(duyetUrls, overrides);
  expect(result.external.customLink).toBe("https://example.com");
});

test("createNavigation() generates main navigation", () => {
  const nav = createNavigation(duyetUrls, {
    personal: {
      shortName: "Duyet",
    },
    social: {
      github: "https://github.com/duyet",
      twitter: "https://twitter.com/duyet",
    },
  });

  expect(nav.main).toHaveLength(5);
  expect(nav.main[0].name).toBe("Blog");
  expect(nav.main[0].href).toBe(duyetUrls.apps.blog);
  expect(nav.main[1].name).toBe("CV");
  expect(nav.main[4].name).toBe("Homelab");
});

test("createNavigation() generates profile navigation", () => {
  const nav = createNavigation(duyetUrls, {
    personal: {
      shortName: "Duyet",
      email: "duyet@example.com",
    },
    social: {
      github: "https://github.com/duyet",
      twitter: "https://twitter.com/duyet",
    },
  } as { personal: PersonalInfo; social: Profile });

  expect(nav.profile).toHaveLength(2);
  expect(nav.profile[0].name).toBe("About");
  expect(nav.profile[0].description).toBe("About Duyet");
  expect(nav.profile[1].name).toBe("Contact");
  expect(nav.profile[1].href).toBe("mailto:duyet@example.com");
});

test("createNavigation() filters missing social links", () => {
  const nav = createNavigation(duyetUrls, {
    personal: {
      shortName: "Duyet",
    },
    social: {},
  });

  expect(nav.social).toHaveLength(0);
});

test("createNavigation() generates social navigation", () => {
  const nav = createNavigation(duyetUrls, {
    personal: {
      shortName: "Duyet",
    },
    social: {
      github: "https://github.com/duyet",
      twitter: "https://twitter.com/duyet",
      linkedin: "https://linkedin.com/in/duyet",
    },
  });

  expect(nav.social).toHaveLength(3);
  expect(nav.social[0].name).toBe("GitHub");
  expect(nav.social[0].external).toBe(true);
  expect(nav.social[0].icon).toBe("github");
});

test("createNavigation() generates general navigation", () => {
  const nav = createNavigation(duyetUrls, {
    personal: {
      shortName: "Duyet",
    },
    social: {
      github: "https://github.com/duyet",
    },
  } as { personal: PersonalInfo; social: Profile });

  expect(nav.general).toBeDefined();
  expect(nav.general).toHaveLength(5);
});

test("getAppUrls() returns all app URLs", () => {
  const urls = getAppUrls(duyetUrls);

  expect(urls.blog).toBe(duyetUrls.apps.blog);
  expect(urls.cv).toBe(duyetUrls.apps.cv);
  expect(urls.insights).toBe(duyetUrls.apps.insights);
  expect(urls.photos).toBe(duyetUrls.apps.photos);
  expect(urls.homelab).toBe(duyetUrls.apps.homelab);
  expect(urls.home).toBe(duyetUrls.apps.home);
});

test("getAppUrl() returns specific app URL", () => {
  const blogUrl = getAppUrl(duyetUrls, "blog");
  expect(blogUrl).toBe(duyetUrls.apps.blog);

  const cvUrl = getAppUrl(duyetUrls, "cv");
  expect(cvUrl).toBe(duyetUrls.apps.cv);
});

test("getAppUrl() returns undefined for non-existent app", () => {
  const result = getAppUrl(duyetUrls, "nonexistent" as any);
  expect(result).toBeUndefined();
});
