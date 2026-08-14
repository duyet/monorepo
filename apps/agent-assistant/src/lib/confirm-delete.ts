export const DELETE_CONVERSATION_PROMPT =
  "Delete this conversation? This cannot be undone.";

export function confirmDeleteConversation(
  confirmFn: (message: string) => boolean = globalThis.confirm,
): boolean {
  return confirmFn(DELETE_CONVERSATION_PROMPT);
}
