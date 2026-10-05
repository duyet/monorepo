import { describe, expect, test } from "vitest";
import { photoSuccess } from "@/lib/errors";

describe("photoSuccess", () => {
  test("wraps a small payload as a successful fetch result", () => {
    expect(photoSuccess({ count: 2 })).toEqual({
      success: true,
      data: { count: 2 },
    });
  });
});
