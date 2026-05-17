import { getScopedSessionName, type AuthContext } from "./auth";

const CHAT_AGENT_ROUTE_NAME = "chat-agent";
const CHAT_AGENT_ROUTE_ALIASES = new Set(["ChatAgent", CHAT_AGENT_ROUTE_NAME]);

export function scopedAgentRequest(
  request: Request,
  auth: AuthContext
): Request | null {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    parts[0] !== "agents" ||
    !parts[1] ||
    !CHAT_AGENT_ROUTE_ALIASES.has(parts[1]) ||
    !parts[2]
  ) {
    return null;
  }

  parts[1] = CHAT_AGENT_ROUTE_NAME;
  parts[2] = getScopedSessionName(auth, parts[2]);
  url.pathname = `/${parts.join("/")}`;

  return new Request(url, request);
}
