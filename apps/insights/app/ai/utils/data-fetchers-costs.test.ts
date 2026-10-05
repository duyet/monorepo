import { describe, expect, test } from "vitest";
import { getCCUsageCosts } from "./data-fetchers";

describe("getCCUsageCosts", () => {
  test("returns no cost rows when analytics is not running on the server", async () => {
    await expect(getCCUsageCosts(7)).resolves.toEqual([]);
  });
});
