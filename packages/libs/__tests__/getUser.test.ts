import { describe, expect, test } from "bun:test";
import { getUser } from "../getUser";

describe("getUser", () => {
  test("should throw an error when called", async () => {
    expect(getUser()).rejects.toThrow(
      "Auth0 authentication has been removed from the codebase"
    );
  });

  test("should be a function", () => {
    expect(typeof getUser).toBe("function");
  });

  test("should always reject", async () => {
    for (let i = 0; i < 3; i++) {
      await expect(getUser()).rejects.toThrow();
    }
  });
});
