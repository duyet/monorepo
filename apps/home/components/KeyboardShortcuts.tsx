"use client";

import { Info, Keyboard, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ShortcutCard {
  id: string;
  key: string;
  name: string;
}

interface KeyboardShortcutsProps {
  cards: ShortcutCard[];
  onNavigate: (id: string) => void;
}

export function useKeyboardShortcuts({
  cards,
  onNavigate,
}: KeyboardShortcutsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Number keys (1-9) for navigation
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (index < cards.length) {
          e.preventDefault();
          const card = cards[index];
          setActiveKey(card.key);
          setShowBadges(true);

          // Navigate immediately on key press
          const linkElement = document.querySelector(
            `[data-shortcut-id="${card.id}"]`
          ) as HTMLAnchorElement;
          if (linkElement) {
            linkElement.focus();
            linkElement.scrollIntoView({ behavior: "smooth", block: "center" });
            // Navigate immediately
            onNavigate(card.id);
          }
        }
      }

      // Numpad support (Numpad1-Numpad9)
      if (e.code.startsWith("Numpad")) {
        const numpadNum = parseInt(e.code.replace("Numpad", ""), 10);
        if (numpadNum >= 1 && numpadNum <= 9) {
          const index = numpadNum - 1;
          if (index < cards.length) {
            e.preventDefault();
            const card = cards[index];
            setActiveKey(card.key);
            setShowBadges(true);

            const linkElement = document.querySelector(
              `[data-shortcut-id="${card.id}"]`
            ) as HTMLAnchorElement;
            if (linkElement) {
              linkElement.focus();
              linkElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              onNavigate(card.id);
            }
          }
        }
      }

      // Escape or 0 to clear focus
      if (e.key === "Escape" || e.key === "0") {
        e.preventDefault();
        setActiveKey(null);
        setShowBadges(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Question mark to toggle help
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        setShowBadges((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards, onNavigate]);

  return { activeKey, showBadges, showHelp, setShowHelp };
}

export function KeyboardShortcutBadge({
  number,
  isActive,
}: {
  number: number;
  isActive: boolean;
}) {
  return (
    <div
      className={`absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold transition-all duration-200 ${
        isActive
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 scale-110"
          : "bg-white/90 text-neutral-900 shadow-sm border border-neutral-200 dark:bg-neutral-900/90 dark:text-white dark:border-white/10"
      }`}
    >
      {number}
    </div>
  );
}

export function KeyboardHelpTooltip({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-neutral-900">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            aria-label="Close help"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">
              Navigate to card
            </span>
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
              1-9
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">
              Clear focus
            </span>
            <div className="flex gap-1">
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                Esc
              </kbd>
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                0
              </kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">
              Toggle this help
            </span>
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
              ?
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KeyboardHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 rounded-full border border-neutral-200 bg-white p-3 shadow-md transition-all hover:scale-105 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
      aria-label="Show keyboard shortcuts"
    >
      <Info className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
    </button>
  );
}
