import type { UIMessage } from "ai";
import { Bubble, BubbleContent, Message, MessageContent } from "@duyet/components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function messageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && Boolean(part.text),
    )
    .map((part) => part.text)
    .join("");
}

export function ChatMessage({ message }: { message: UIMessage }) {
  const text = messageText(message);
  if (!text.trim()) return null;

  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent>{text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message align="start">
      <MessageContent>
        <div className="typeset-docs px-1.5 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      </MessageContent>
    </Message>
  );
}
