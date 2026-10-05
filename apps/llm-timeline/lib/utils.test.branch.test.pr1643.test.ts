import { describe, expect, it } from "vitest";
import { formatDate } from "./utils";

describe("formatDate", () => {
  it("formats a timestamp as a short US month and day", () => {
    expect(formatDate("2026-03-04T12:00:00.000Z")).toBe("Mar 4");
  });
});
