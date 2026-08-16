import { describe, expect, it } from "vitest";
import { type SubmissionInput, validateSubmission } from "./submit-fn";

function input(overrides: Partial<SubmissionInput> = {}): SubmissionInput {
  return {
    url: "https://example.com/post",
    title: "A valid story title",
    note: "",
    user_id: "user_1",
    user_name: "duyet",
    ...overrides,
  };
}

describe("validateSubmission", () => {
  it("accepts a valid submission", () => {
    expect(validateSubmission(input())).toEqual({
      url: "https://example.com/post",
      title: "A valid story title",
    });
  });

  it("rejects a title shorter than 5 characters", () => {
    expect(() => validateSubmission(input({ title: "Hi" }))).toThrow();
  });

  it("rejects a title longer than 300 characters", () => {
    expect(() =>
      validateSubmission(input({ title: "a".repeat(301) }))
    ).toThrow();
  });

  it("rejects a malformed URL", () => {
    expect(() => validateSubmission(input({ url: "not a url" }))).toThrow();
  });

  it("rejects a non-http(s) URL", () => {
    expect(() =>
      validateSubmission(input({ url: "ftp://example.com/file" }))
    ).toThrow();
  });

  it("rejects a missing user_id (not signed in)", () => {
    expect(() => validateSubmission(input({ user_id: "" }))).toThrow();
  });
});
