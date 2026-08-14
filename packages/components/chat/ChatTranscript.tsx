"use client";

import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
} from "../ui/attachment";
import { Bubble, BubbleContent } from "../ui/bubble";
import { Marker, MarkerContent } from "../ui/marker";
import { Message, MessageContent } from "../ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../ui/message-scroller";

export type ChatTranscriptMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  attachmentLabel?: string;
};

export function ChatMessageList({
  messages,
  markerLabel = "Conversation",
}: {
  messages: ChatTranscriptMessage[];
  markerLabel?: string;
}) {
  return (
    <>
      <Marker variant="separator">
        <MarkerContent>{markerLabel}</MarkerContent>
      </Marker>
      {messages.map((message) => {
        const align = message.role === "user" ? "end" : "start";
        return (
          <Message key={message.id} align={align}>
            <MessageContent>
              <Bubble
                variant={message.role === "user" ? "default" : "muted"}
                align={align}
              >
                <BubbleContent>{message.text}</BubbleContent>
              </Bubble>
              {message.attachmentLabel ? (
                <Attachment state="done">
                  <AttachmentContent>
                    <AttachmentTitle>{message.attachmentLabel}</AttachmentTitle>
                  </AttachmentContent>
                </Attachment>
              ) : null}
            </MessageContent>
          </Message>
        );
      })}
    </>
  );
}

export function ChatTranscript({
  messages,
  markerLabel = "Conversation",
}: {
  messages: ChatTranscriptMessage[];
  markerLabel?: string;
}) {
  return (
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageScrollerItem>
              <ChatMessageList messages={messages} markerLabel={markerLabel} />
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
