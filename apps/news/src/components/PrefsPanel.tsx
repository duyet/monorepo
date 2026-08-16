import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/lang-context";
import {
  applyReaderTheme,
  type ReaderBg,
  type ReaderDensity,
  type ReaderFont,
  usePrefs,
} from "../lib/prefs";

const BG_SWATCHES: { key: ReaderBg; color: string }[] = [
  { key: "default", color: "var(--background)" },
  { key: "cream", color: "#faf6ec" },
  { key: "gray", color: "#d9d9d6" },
  { key: "dark", color: "#2a2a28" },
  { key: "black", color: "#000000" },
];

const DENSITIES: ReaderDensity[] = ["compact", "comfortable", "spacious"];

export function PrefsPanel() {
  const { prefs, setPrefs } = usePrefs();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  const setBg = (bg: ReaderBg) => {
    setPrefs({ bg });
    applyReaderTheme(bg);
  };

  const sectionToggles: { key: keyof typeof prefs.sections; label: string }[] =
    [
      { key: "trending", label: t("Trending", "Xu hướng") },
      { key: "tldr", label: "TL;DR" },
      { key: "days", label: t("Daily feed", "Bảng tin theo ngày") },
      { key: "categories", label: t("Category nav", "Danh mục") },
    ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Reader preferences", "Tuỳ chỉnh hiển thị")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="rounded-full px-2.5 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        Aa
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("Reader preferences", "Tuỳ chỉnh hiển thị")}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-4 text-sm shadow-xl"
        >
          <div className="mb-3 grid grid-cols-2 gap-2">
            {(["sans", "serif"] satisfies ReaderFont[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPrefs({ font: f })}
                aria-pressed={prefs.font === f}
                className={`rounded-md border px-3 py-2 text-left ${
                  prefs.font === f ? "border-accent bg-muted" : "border-border"
                }`}
              >
                <span
                  className={
                    f === "serif" ? "font-serif text-base" : "text-base"
                  }
                >
                  Aa
                </span>
                <div className="text-xs text-muted-foreground">
                  {f === "sans"
                    ? t("Sans", "Không chân")
                    : t("Serif", "Có chân")}
                </div>
              </button>
            ))}
          </div>

          <label className="mb-3 block">
            <span className="mb-1 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{t("Text size", "Cỡ chữ")}</span>
              <span>{Math.round(prefs.fontSize * 100)}%</span>
            </span>
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.05}
              value={prefs.fontSize}
              onChange={(e) => setPrefs({ fontSize: Number(e.target.value) })}
              className="w-full"
              aria-label={t("Text size", "Cỡ chữ")}
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs text-muted-foreground">
              {t("Density", "Mật độ")}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={DENSITIES.indexOf(prefs.density)}
              onChange={(e) =>
                setPrefs({ density: DENSITIES[Number(e.target.value)] })
              }
              className="w-full"
              aria-label={t("Density", "Mật độ")}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{t("Compact", "Gọn")}</span>
              <span>{t("Comfortable", "Vừa")}</span>
              <span>{t("Spacious", "Thoáng")}</span>
            </div>
          </label>

          <div className="mb-3">
            <span className="mb-1 block text-xs text-muted-foreground">
              {t("Background", "Nền")}
            </span>
            <div className="flex gap-2">
              {BG_SWATCHES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setBg(s.key)}
                  aria-label={s.key}
                  aria-pressed={prefs.bg === s.key}
                  style={{ background: s.color }}
                  className={`h-6 w-6 shrink-0 rounded-full border ${
                    prefs.bg === s.key
                      ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background"
                      : "border-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-xs text-muted-foreground">
              {t("Sections", "Mục hiển thị")}
            </span>
            <div className="space-y-1">
              {sectionToggles.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between py-0.5"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={prefs.sections[key]}
                    onChange={(e) =>
                      setPrefs({
                        sections: {
                          ...prefs.sections,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
