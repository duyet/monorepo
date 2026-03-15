"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  KeyboardHelpButton,
  KeyboardHelpTooltip,
} from "../../components/KeyboardShortcuts";

export function KeyboardFeatures() {
  const [showBadges, setShowBadges] = useState(false);
  const [_activeKey, setActiveKey] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const router = useRouter();

  // Define keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Number keys 1-9 for navigation
      if (e.key >= "1" && e.key <= "9") {
        const link = document.querySelector(
          `[data-shortcut-number="${e.key}"]`
        ) as HTMLAnchorElement;
        if (link) {
          e.preventDefault();
          router.push(link.href);
        }
      }

      // Question mark for help
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }

      // Update active key for visual feedback
      if (e.key >= "1" && e.key <= "9") {
        setActiveKey(e.key);
        setTimeout(() => setActiveKey(null), 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Show badges after initial render to avoid blocking
    const badgeTimer = setTimeout(() => setShowBadges(true), 300);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(badgeTimer);
    };
  }, [router]);

  // Update badge visibility
  useEffect(() => {
    if (showBadges) {
      document.body.classList.add("keyboard-shortcuts-enabled");
      return () => document.body.classList.remove("keyboard-shortcuts-enabled");
    }
  }, [showBadges]);

  return (
    <>
      {showBadges && (
        <style>{`
          [data-shortcut-number]::before {
            content: attr(data-shortcut-number);
            position: absolute;
            top: 12px;
            right: 12px;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.1);
            color: #666;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0, 0, 0, 0.1);
            transition: all 0.15s ease;
          }
          .dark [data-shortcut-number]::before {
            background: rgba(255, 255, 255, 0.1);
            color: #999;
            border-color: rgba(255, 255, 255, 0.1);
          }
          [data-shortcut-number]:hover::before {
            background: rgba(0, 0, 0, 0.15);
            color: #333;
          }
          .dark [data-shortcut-number]:hover::before {
            background: rgba(255, 255, 255, 0.15);
            color: #ccc;
          }
        `}</style>
      )}
      <KeyboardHelpTooltip
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      <KeyboardHelpButton onClick={() => setShowHelp(true)} />
    </>
  );
}
