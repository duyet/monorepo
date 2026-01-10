// Version navigation slider component
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Version } from "../../blog/types";

interface TimelineSliderProps {
  versions: Version[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function TimelineSlider({
  versions,
  currentIndex,
  onIndexChange,
}: TimelineSliderProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (versions.length === 1) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Version History
        </h3>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {currentIndex + 1} / {versions.length}
        </span>
      </div>

      {/* Desktop slider */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous version"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full relative">
            {versions.map((_, idx) => (
              <button
                key={String(idx)}
                onClick={() => onIndexChange(idx)}
                className={`absolute w-4 h-4 -top-1 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-blue-600 dark:bg-blue-400 shadow-lg"
                    : "bg-neutral-400 dark:bg-neutral-500 hover:bg-neutral-500"
                }`}
                style={{
                  left: `${(idx / (versions.length - 1 || 1)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
                title={versions[idx].label}
              />
            ))}
          </div>

          <button
            onClick={() =>
              onIndexChange(Math.min(versions.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === versions.length - 1}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next version"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Mobile stepper */}
      {isMobile && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {versions.map((version, idx) => (
            <button
              key={`stepper-${idx}`}
              onClick={() => onIndexChange(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                idx === currentIndex
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {version.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
