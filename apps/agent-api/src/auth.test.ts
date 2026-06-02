import { describe, expect, test } from "vitest";
import {
  getAuthorizedParties,
  getBearerToken,
  getScopedSessionName,
  normalizeSessionPart,
  SCOPED_SESSION_MAX_LENGTH,
  SESSION_PART_MAX_LENGTH,
  timingSafeEqual,
  type AuthContext,
} from "./auth";

describe("auth helpers", () => {
  test("extracts bearer tokens", () => {
    const request = new Request("https://agents.duyet.net/api/v1/chat", {
      headers: { Authorization: "Bearer token-123" },
    });

    expect(getBearerToken(request)).toBe("token-123");
  });

  test("ignores missing and non-bearer authorization headers", () => {
    expect(
      getBearerToken(new Request("https://agents.duyet.net/api/v1/chat"))
    ).toBeNull();
    expect(
      getBearerToken(
        new Request("https://agents.duyet.net/api/v1/chat", {
          headers: { Authorization: "Basic abc123" },
        })
      )
    ).toBeNull();
  });

  test("compares tokens without early length match", () => {
    expect(timingSafeEqual("secret", "secret")).toBe(true);
    expect(timingSafeEqual("secret", "different")).toBe(false);
    expect(timingSafeEqual("secret", undefined)).toBe(false);
    expect(timingSafeEqual("", "")).toBe(false);
    expect(timingSafeEqual("", "nonempty")).toBe(false);
  });

  test("normalizes session ids", () => {
    expect(normalizeSessionPart(" user@example.com/default ")).toBe(
      "user-example-com-default"
    );
    expect(normalizeSessionPart("@#$%")).toBe("default");
    expect(normalizeSessionPart("a".repeat(128))).toHaveLength(
      SESSION_PART_MAX_LENGTH
    );
  });

  test("scopes sessions to auth identity", () => {
    const auth: AuthContext = { mode: "clerk", ownerId: "user_123" };

    expect(getScopedSessionName(auth, "default")).toBe(
      "clerk-user_123-default"
    );
    expect(
      getScopedSessionName(
        { mode: "clerk", ownerId: "u".repeat(300) },
        "s".repeat(300)
      )
    ).toHaveLength(SCOPED_SESSION_MAX_LENGTH);
  });

  test("includes configured Clerk authorized parties", () => {
    expect(
      getAuthorizedParties({
        CLERK_AUTHORIZED_PARTIES: "https://custom.example.com",
      })
    ).toContain("https://custom.example.com");
  });
});
