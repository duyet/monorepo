import { describe, expect, test } from "vitest";
import { describeAnalyticsSource } from "../analytics-source";

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
