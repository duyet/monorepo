/** Map a raw chat/transport error to copy a person can act on. */
export function userFacingChatError(error: { message?: string } | null): string {
  const raw = error?.message?.trim() ?? "";
  const lower = raw.toLowerCase();
  if (!raw) return "The request failed. Try again.";
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Could not reach the chat service. Check your connection and try again.";
  }
  if (lower.includes("401") || lower.includes("unauthorized")) {
    return "Sign-in expired. Sign in again and retry.";
  }
  if (lower.includes("429") || lower.includes("rate")) {
    return "Too many requests. Wait a moment and try again.";
  }
  if (lower.includes("500") || lower.includes("502") || lower.includes("503")) {
    return "The chat service had a problem. Try again.";
  }
  return "The request failed. Try again.";
}
