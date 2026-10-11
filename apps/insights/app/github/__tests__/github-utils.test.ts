import { afterEach, describe, expect, test, vi } from "vitest";
import { getGithubToken } from "../github-utils";

const originalToken = process.env.GITHUB_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalToken;
  vi.restoreAllMocks();
});

describe("getGithubToken", () => {
  test("returns the configured token", () => {
    process.env.GITHUB_TOKEN = "fixture-token";
    expect(getGithubToken()).toBe("fixture-token");
  });

  test("returns null when the token is missing", () => {
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getGithubToken()).toBeNull();
  });
});
