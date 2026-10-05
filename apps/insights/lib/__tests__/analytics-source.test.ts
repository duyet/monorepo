import { afterEach, describe, expect, test } from "vitest";
import { ANALYTICS_CACHE_PATH } from "../analytics-cache-path";
import {
  describeAnalyticsSource,
  getAnalyticsSource,
} from "../analytics-source";

describe("describeAnalyticsSource", () => {
  test("names a MotherDuck database", () => {
    expect(
      describeAnalyticsSource({
        kind: "motherduck",
        database: "duyet_analytics",
        token: "token",
      })
    ).toBe("MotherDuck (md:duyet_analytics)");
  });
});

describe("getAnalyticsSource", () => {
  const originalToken = process.env.MOTHERDUCK_TOKEN;
  const originalDatabase = process.env.MOTHERDUCK_DATABASE;

  afterEach(() => {
    if (originalToken === undefined) delete process.env.MOTHERDUCK_TOKEN;
    else process.env.MOTHERDUCK_TOKEN = originalToken;
    if (originalDatabase === undefined) delete process.env.MOTHERDUCK_DATABASE;
    else process.env.MOTHERDUCK_DATABASE = originalDatabase;
  });

  test("uses MotherDuck when a token is set", () => {
    process.env.MOTHERDUCK_TOKEN = "fixture-token";
    process.env.MOTHERDUCK_DATABASE = "fixture_db";

    expect(getAnalyticsSource()).toEqual({
      kind: "motherduck",
      database: "fixture_db",
      token: "fixture-token",
    });
  });

  test("falls back to the local cache file when no token is set", () => {
    delete process.env.MOTHERDUCK_TOKEN;
    delete process.env.MOTHERDUCK_DATABASE;

    expect(getAnalyticsSource()).toEqual({
      kind: "local",
      path: ANALYTICS_CACHE_PATH,
    });
  });
});
