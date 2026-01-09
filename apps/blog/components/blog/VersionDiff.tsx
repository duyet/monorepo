"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  GitCommit,
} from "lucide-react";
import type { Version, VersionDiffProps } from "./types";

/**
 * Parse diff content into structured lines with type information
 */
function parseDiffLines(diff: string) {
  return diff.split("\n").map((line, index) => ({
    id: String(index),
    content: line,
    type: line.startsWith("+")
      ? "added"
      : line.startsWith("-")
        ? "removed"
        : "context",
  }));
}

/**
 * Determine if a version is upcoming based on its date
 */
function isVersionUpcoming(date: Date | string): boolean {
  const versionDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return versionDate > today;
}

/**
 * Format date in git-style format
 */
function formatGitDate(date: Date | string): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return dateObj.toLocaleDateString("en-US", options);
}

/**
 * Diff line component with color coding
 */
function DiffLine({
  line,
}: {
  line: { id: string; content: string; type: string };
}) {
  const bgColor =
    line.type === "added"
      ? "bg-green-50 dark:bg-green-950/30"
      : line.type === "removed"
        ? "bg-red-50 dark:bg-red-950/30"
        : "";

  const textColor =
    line.type === "added"
      ? "text-green-700 dark:text-green-300"
      : line.type === "removed"
        ? "text-red-700 dark:text-red-300"
        : "text-neutral-700 dark:text-neutral-300";

  return (
    <div
      key={line.id}
      className={`font-mono text-sm leading-relaxed ${bgColor} ${textColor} px-3 py-1 border-l-2 ${
        line.type === "added"
          ? "border-green-500"
          : line.type === "removed"
            ? "border-red-500"
            : "border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <span className="select-none inline-block w-4">{line.content[0]}</span>
      <span className="whitespace-pre-wrap break-words">
        {line.content.slice(1)}
      </span>
    </div>
  );
}

/**
 * Timeline slider component for version navigation
 */
function TimelineSlider({
  versions,
  currentIndex,
  onIndexChange,
  isUpcoming,
}: {
  versions: Version[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isUpcoming: (index: number) => boolean;
}) {
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

/**
 * Version metadata header
 */
function VersionHeader({
  version,
  isUpcoming: upcoming,
}: {
  version: Version;
  isUpcoming: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
    >
      <div className="flex flex-col gap-3">
        {/* Label and upcoming badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitCommit
              size={18}
              className="text-neutral-600 dark:text-neutral-400"
            />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {version.label}
            </h2>
          </div>
          {upcoming && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium"
            >
              <Clock size={14} />
              Coming Soon
            </motion.div>
          )}
        </div>

        {/* Message and date */}
        <div className="space-y-2">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {version.message}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar size={14} />
            <time dateTime={new Date(version.date).toISOString()}>
              {formatGitDate(version.date)}
            </time>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main VersionDiff component
 * Displays version history with diff highlighting and timeline navigation
 */
export function VersionDiff({
  versions,
  onVersionChange,
  className = "",
  initialIndex,
  showMetadata = true,
  diffHeight = "600px",
}: VersionDiffProps) {
  // Handle edge cases
  if (!versions || versions.length === 0) {
    return (
      <div
        className={`rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-8 text-center ${className}`}
      >
        <p className="text-neutral-600 dark:text-neutral-400">
          No versions available
        </p>
      </div>
    );
  }

  // State management
  const defaultIndex = initialIndex ?? versions.length - 1;
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, defaultIndex), versions.length - 1)
  );

  // Get current version and its metadata
  const currentVersion = versions[currentIndex];
  const upcoming = useMemo(
    () => isVersionUpcoming(currentVersion.date),
    [currentVersion.date]
  );

  // Parse diff lines
  const diffLines = useMemo(
    () => parseDiffLines(currentVersion.diff),
    [currentVersion.diff]
  );

  // Handle version change
  const handleVersionChange = (index: number) => {
    setCurrentIndex(index);
    onVersionChange?.(versions[index], index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-4 ${className}`}
    >
      {/* Timeline slider */}
      {versions.length > 1 && (
        <TimelineSlider
          versions={versions}
          currentIndex={currentIndex}
          onIndexChange={handleVersionChange}
          isUpcoming={(idx) => isVersionUpcoming(versions[idx].date)}
        />
      )}

      {/* Version metadata */}
      {showMetadata && (
        <VersionHeader version={currentVersion} isUpcoming={upcoming} />
      )}

      {/* Diff content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVersion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900"
        >
          <div
            className="overflow-y-auto space-y-0 font-mono text-sm"
            style={{ maxHeight: diffHeight }}
          >
            {diffLines.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                No changes
              </div>
            ) : (
              diffLines.map((line) => <DiffLine key={line.id} line={line} />)
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats footer */}
      {diffLines.length > 0 && (
        <div className="flex gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
            {diffLines.filter((l) => l.type === "added").length} added
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
            {diffLines.filter((l) => l.type === "removed").length} removed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
            {diffLines.filter((l) => l.type === "context").length} context
          </span>
        </div>
      )}
    </motion.div>
  );
}
