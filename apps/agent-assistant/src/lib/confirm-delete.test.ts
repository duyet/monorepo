import { describe, expect, it } from "vitest";
import {
  confirmDeleteConversation,
  DELETE_CONVERSATION_PROMPT,
} from "./confirm-delete";

describe("confirmDeleteConversation", () => {
  it("asks before deleting and honors cancel", () => {
    expect(confirmDeleteConversation(() => false)).toBe(false);
    expect(confirmDeleteConversation(() => true)).toBe(true);
  });

  it("uses the irreversible-delete prompt", () => {
    let seen = "";
    confirmDeleteConversation((message) => {
      seen = message;
      return false;
    });
    expect(seen).toBe(DELETE_CONVERSATION_PROMPT);
    expect(seen.toLowerCase()).toContain("cannot be undone");
  });
});
