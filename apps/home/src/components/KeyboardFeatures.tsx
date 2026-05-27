import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function KeyboardFeatures() {
  const [showBadges, setShowBadges] = useState(false);

  const navigate = useNavigate();

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
          const href = link.getAttribute("href") || link.href;
          if (href.startsWith("/")) {
            navigate({ to: href });
          } else {
            window.location.href = href;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Show badges after initial render to avoid blocking LCP
    const badgeTimer = setTimeout(() => setShowBadges(true), 300);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(badgeTimer);
    };
  }, [navigate]);

  // Sync badge class onto body
  useEffect(() => {
    if (showBadges) {
      document.body.classList.add("keyboard-shortcuts-enabled");
      return () => document.body.classList.remove("keyboard-shortcuts-enabled");
    }
  }, [showBadges]);

  if (!showBadges) return null;

  return (
    <style>{`
      [data-shortcut-number]::before {
        content: attr(data-shortcut-number);
        position: absolute;
        top: 12px;
        right: 12px;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.07);
        color: #666;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      .dark [data-shortcut-number]::before {
        background: rgba(255, 255, 255, 0.08);
        color: #999;
        border-color: rgba(255, 255, 255, 0.1);
      }
    `}</style>
  );
}
