/**
 * Conversation Item Component
 *
 * Individual conversation item in the history sidebar.
 */

"use client";

import { useCallback } from "react";
import type { Conversation } from "@/types/conversation";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  const handleClick = useCallback(() => {
    onSelect(conversation.threadId);
  }, [conversation.threadId, onSelect]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(conversation.threadId);
    },
    [conversation.threadId, onDelete],
  );

  return (
    <button
      onClick={handleClick}
      className={`
        group relative w-full rounded-md px-2 py-2 text-left transition-colors
        ${
          isActive
            ? "bg-slate-200 dark:bg-slate-700"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }
      `}
      aria-label={`Switch to conversation: ${conversation.title}`}
      aria-current={isActive ? "true" : "false"}
    >
      {/* Main content */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Title only - compact style like ChatGPT */}
          <h3
            className={`
              truncate text-sm
              ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}
            `}
          >
            {conversation.title}
          </h3>
        </div>

        {/* Delete button (shows on hover) */}
        <button
          onClick={handleDelete}
          className="
            opacity-0 transition-opacity group-hover:opacity-100
            rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600
            dark:hover:bg-slate-600 dark:hover:text-slate-300
          "
          aria-label={`Delete conversation: ${conversation.title}`}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </button>
  );
}
