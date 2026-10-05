import { describe, expect, test } from "vitest";
import { getTypeBadgeVariant } from "./utils";

describe("getTypeBadgeVariant", () => {
  test("returns the milestone badge for a milestone", () => {
    expect(getTypeBadgeVariant("milestone")).toBe("milestone");
  });
});
