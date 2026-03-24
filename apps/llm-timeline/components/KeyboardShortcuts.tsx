import { cn } from "@duyet/libs/utils";
import { Info, Keyboard, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface ShortcutOrg {
  id: string;
  key: string;
  name: string;
}

interface KeyboardShortcutsProps {
  organizations: string[];
  onFilterByOrg: (org: string) => void;
  onClearFilters: () => void;
}

// Top organizations by model count (based on data analysis)
const TOP_ORGANIZATIONS = [
  "Google",
  "Google DeepMind",
  "Meta",
  "OpenAI",
  "Microsoft",
  "Anthropic",
  "NVIDIA",
  "University of California, Berkeley",
  "Stanford University",
];

export function useKeyboardShortcuts({
  organizations,
  onFilterByOrg,
  onClearFilters,
}: KeyboardShortcutsProps) {
  // Take top 9 organizations for keyboard shortcuts
  const shortcutOrgs = useMemo<ShortcutOrg[]>(() => {
    return TOP_ORGANIZATIONS.slice(0, 9)
      .filter((org) => organizations.includes(org))
      .map((name, index) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        key: String(index + 1),
        name,
      }));
  }, [organizations]);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Number keys (1-9) for organization filtering
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (index < shortcutOrgs.length) {
          e.preventDefault();
          const org = shortcutOrgs[index];
          setActiveKey(org.key);
          setShowBadges(true);
          onFilterByOrg(org.name);
        }
      }

      // Numpad support (Numpad1-Numpad9)
      if (e.code.startsWith("Numpad")) {
        const numpadNum = parseInt(e.code.replace("Numpad", ""), 10);
        if (numpadNum >= 1 && numpadNum <= 9) {
          const index = numpadNum - 1;
          if (index < shortcutOrgs.length) {
            e.preventDefault();
            const org = shortcutOrgs[index];
            setActiveKey(org.key);
            setShowBadges(true);
            onFilterByOrg(org.name);
          }
        }
      }

      // Escape to clear filters
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveKey(null);
        setShowBadges(false);
        onClearFilters();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
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
  }, [shortcutOrgs, onFilterByOrg, onClearFilters]);

  return {
    activeKey,
    showBadges,
    showHelp,
    setShowHelp,
    shortcutOrgs,
  };
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
      className={cn(
        "absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold transition-all duration-200",
        isActive
          ? "bg-foreground text-background scale-110"
          : "bg-card/90 text-foreground shadow-sm border border-border"
      )}
    >
      {number}
    </div>
  );
}

export function KeyboardHelpTooltip({
  isOpen,
  onClose,
  shortcutOrgs,
}: {
  isOpen: boolean;
  onClose: () => void;
  shortcutOrgs: ShortcutOrg[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Keyboard Shortcuts
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            aria-label="Close help"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="text-xs">
            <p className="text-muted-foreground mb-2">
              Filter by organization:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {shortcutOrgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-foreground/80">
                    {org.name}
                  </span>
                  <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-foreground">
                    {org.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-2 space-y-2">
            {[
              ["Clear filters", "Esc"],
              ["Toggle this help", "?"],
              ["Open comparison (2+ selected)", "c"],
            ].map(([label, key]) => (
              <div
                key={key}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  {key}
                </kbd>
              </div>
            ))}
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
      className="fixed bottom-6 right-6 z-40 rounded-full border border-border bg-card p-3 shadow-md transition-all hover:scale-105 hover:shadow-lg"
      aria-label="Show keyboard shortcuts"
    >
      <Info className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
