import { describe, expect, test } from "vitest";
import { getTrafficData } from "./helpers";

describe("getTrafficData", () => {
  test("maps one daily Cloudflare group into chart points", () => {
    const points = getTrafficData({
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [
                {
                  date: { date: "2026-10-05" },
                  sum: { pageViews: 12, requests: 40 },
                  uniq: { uniques: 7 },
                },
              ],
            },
          ],
        },
      },
      days: 7,
      generatedAt: "2026-10-05T00:00:00.000Z",
      totalPageviews: 12,
      totalRequests: 40,
    });

    expect(points).toEqual([
      { date: "Oct 5", pageViews: 12, requests: 40, visitors: 7 },
    ]);
  });
});
