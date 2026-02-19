/**
 * Conversation List Component
 *
 * Displays a list of conversations in the history sidebar.
 */

"use client";

import { ConversationItem } from "./ConversationItem";
import type { Conversation } from "@/types/conversation";

interface ConversationListProps {
  conversations: Conversation[];
  activeThreadId: string | null;
  onSelectConversation: (threadId: string) => void;
  onDeleteConversation: (threadId: string) => void;
  onNewChat: () => void;
}

export function ConversationList({
  conversations,
  activeThreadId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}: ConversationListProps) {
  // Sort conversations by last activity (most recent first)
  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastActivityAt - a.lastActivityAt,
  );

  return (
    <div className="flex h-full flex-col">
      {/* New Chat Button - Compact style */}
      <div className="flex-shrink-0 border-b border-slate-200 p-2 dark:border-slate-700">
        <button
          onClick={onNewChat}
          className="
            flex w-full items-center justify-center gap-2 rounded-md
            border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700
            transition-colors hover:bg-slate-50
            dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700
          "
          aria-label="Start new conversation"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversation List - Compact spacing */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-slate-400 dark:text-slate-500">
              No conversations yet.
              <br />
              Start a new chat to begin!
            </p>
          </div>
        ) : (
          <div
            className="space-y-0.5"
            role="list"
            aria-label="Conversation history"
          >
            {sortedConversations.map((conversation) => (
              <div key={conversation.threadId} role="listitem">
                <ConversationItem
                  conversation={conversation}
                  isActive={activeThreadId === conversation.threadId}
                  onSelect={onSelectConversation}
                  onDelete={onDeleteConversation}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
