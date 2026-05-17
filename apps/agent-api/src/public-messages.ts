import type { SubmitApiMessageResult } from "./agent";

export interface PublicMessageMetadata {
  id: string;
  role: SubmitApiMessageResult["messages"][number]["role"];
  text: string;
}

export function toPublicMessageMetadata(
  messages: SubmitApiMessageResult["messages"]
): PublicMessageMetadata[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    text: message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim(),
  }));
}
