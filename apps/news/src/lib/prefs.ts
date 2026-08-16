import { createContext, useContext } from "react";

export type ReaderFont = "sans" | "serif";
export type ReaderDensity = "compact" | "comfortable" | "spacious";
export type ReaderBg = "default" | "cream" | "gray" | "dark" | "black";
export type TldrCount = 8 | 12 | 16;

export interface ReaderSections {
  trending: boolean;
  tldr: boolean;
  days: boolean;
  categories: boolean;
}

export interface Prefs {
  font: ReaderFont;
  fontSize: number;
  density: ReaderDensity;
  bg: ReaderBg;
  sections: ReaderSections;
  tldrCount: TldrCount;
  /** Remembers the StoryDialog's EN|VI side-by-side toggle across stories. */
  bilingualDialog: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  font: "sans",
  fontSize: 1,
  density: "compact",
  bg: "default",
  sections: { trending: true, tldr: true, days: true, categories: true },
  tldrCount: 8,
  bilingualDialog: false,
};

const STORAGE_KEY = "news_prefs";
const FONT_SIZE_MIN = 0.85;
const FONT_SIZE_MAX = 1.25;
const TLDR_COUNTS: TldrCount[] = [8, 12, 16];

function clampFontSize(value: unknown): number {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : DEFAULT_PREFS.fontSize;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, n));
}

function clampTldrCount(value: unknown): TldrCount {
  return TLDR_COUNTS.includes(value as TldrCount)
    ? (value as TldrCount)
    : DEFAULT_PREFS.tldrCount;
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      fontSize: clampFontSize(parsed.fontSize),
      tldrCount: clampTldrCount(parsed.tldrCount),
      sections: { ...DEFAULT_PREFS.sections, ...parsed.sections },
      bilingualDialog:
        typeof parsed.bilingualDialog === "boolean"
          ? parsed.bilingualDialog
          : DEFAULT_PREFS.bilingualDialog,
    };
  } catch {
    // malformed/unavailable storage — fall back to defaults
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable (private mode) — prefs just won't persist
  }
}

const DENSITY_PAD: Record<ReaderDensity, string> = {
  compact: "0.5rem",
  comfortable: "0.75rem",
  spacious: "1.125rem",
};

export function readerCssVars(prefs: Prefs): Record<string, string> {
  return {
    "--reader-font-size": String(clampFontSize(prefs.fontSize)),
    "--reader-pad": DENSITY_PAD[prefs.density],
  };
}

/**
 * Sync next-themes' dark/light class + localStorage for the "dark"/"black"
 * swatches. next-themes only reacts to `storage` events fired from OTHER
 * tabs, so a synthetic one is dispatched to keep its own toggle in sync
 * within this tab too.
 */
export function applyReaderTheme(bg: ReaderBg): void {
  if (typeof document === "undefined") return;
  const wantsDark = bg === "dark" || bg === "black";
  const next = wantsDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", wantsDark);
  try {
    localStorage.setItem("theme", next);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: next })
    );
  } catch {
    // ignore
  }
}

export interface PrefsContextValue {
  prefs: Prefs;
  setPrefs: (update: Partial<Prefs>) => void;
}

export const PrefsContext = createContext<PrefsContextValue>({
  prefs: DEFAULT_PREFS,
  setPrefs: () => {},
});

export function usePrefs(): PrefsContextValue {
  return useContext(PrefsContext);
}
