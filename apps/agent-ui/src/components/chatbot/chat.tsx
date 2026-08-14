import type { UIMessage } from "ai";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@duyet/components";
import { ChatMessage } from "./chat-message";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty";
import { Suggestions } from "./suggestions";

export function ChatConversation({
  messages,
  isBusy,
  canSubmit,
  onSelectSuggestion,
}: {
  messages: UIMessage[];
  isBusy: boolean;
  canSubmit: boolean;
  onSelectSuggestion: (prompt: string) => void;
}) {
  const lastMessage = messages.at(-1);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Ask Duyet anything.</EmptyTitle>
            <EmptyDescription>
              An agent grounded in my blog, projects, and public data —
              conversational and streaming.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Suggestions
              disabled={!canSubmit}
              onSelect={onSelectSuggestion}
            />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
            {messages.map((message) => (
              <MessageScrollerItem key={message.id}>
                <ChatMessage message={message} />
              </MessageScrollerItem>
            ))}
            {isBusy && lastMessage?.role === "user" ? (
              <MessageScrollerItem>
                <div className="shimmer flex items-center gap-2 px-3 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </MessageScrollerItem>
            ) : null}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
