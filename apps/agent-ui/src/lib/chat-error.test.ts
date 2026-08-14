import { describe, expect, it } from "vitest";
import { userFacingChatError } from "./chat-error";

describe("userFacingChatError", () => {
  it("does not surface a raw fetch failure", () => {
    const text = userFacingChatError({ message: "Failed to fetch" });
    expect(text.toLowerCase()).not.toContain("failed to fetch");
    expect(text.toLowerCase()).toContain("try again");
  });

  it("maps unauthorized to a sign-in hint", () => {
    expect(userFacingChatError({ message: "401 Unauthorized" })).toMatch(
      /sign in/i,
    );
  });

  it("still offers a retry path for empty errors", () => {
    expect(userFacingChatError(null)).toMatch(/try again/i);
  });
});
