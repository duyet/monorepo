/**
 * Conversation Sidebar Component
 *
 * Sidebar container with toggle functionality for conversation history.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { ConversationList } from "./ConversationList";
import type { Conversation } from "@/types/conversation";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeThreadId: string | null;
  onSelectConversation: (threadId: string | null) => void;
  onDeleteConversation: (threadId: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const SIDEBAR_STATE_KEY = "chatkit_sidebar_open";

/**
 * Loads sidebar state from localStorage
 */
function loadSidebarState(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

/**
 * Saves sidebar state to localStorage
 */
function saveSidebarState(isOpen: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(isOpen));
  } catch {
    // Silent fail
  }
}

export function ConversationSidebar({
  conversations,
  activeThreadId,
  onSelectConversation,
  onDeleteConversation,
  isOpen: controlledIsOpen,
  onToggle,
}: ConversationSidebarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(loadSidebarState);

  const isOpen = controlledIsOpen ?? internalIsOpen;

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setInternalIsOpen(newState);
    saveSidebarState(newState);
    onToggle?.(newState);
  }, [isOpen, onToggle]);

  const handleNewChat = useCallback(() => {
    onSelectConversation(null);
  }, [onSelectConversation]);

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggle]);

  return (
    <>
      {/* Toggle Button - Always visible, compact */}
      <button
        onClick={handleToggle}
        className={`
          fixed left-3 top-3 z-50 rounded-md p-1.5 shadow-md transition-all
          bg-white text-slate-700 hover:bg-slate-100
          dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
          ${isOpen ? "translate-x-64" : "translate-x-0"}
        `}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
        title={`${isOpen ? "Close" : "Open"} sidebar (Cmd/Ctrl+B)`}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          )}
        </svg>
      </button>

      {/* Sidebar - Compact style */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-64 transform border-r
          border-slate-200 bg-white shadow-lg transition-transform duration-300
          dark:border-slate-700 dark:bg-slate-900
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-hidden={!isOpen}
      >
        {/* Header - Compact */}
        <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Chat History
          </h2>
        </div>

        {/* Conversation List */}
        <div className="h-[calc(100vh-3rem)]">
          <ConversationList
            conversations={conversations}
            activeThreadId={activeThreadId}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            onNewChat={handleNewChat}
          />
        </div>
      </aside>

      {/* Overlay for mobile - clicks outside sidebar to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={handleToggle}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
