"use client";

// Main VersionDiff component - refactored into smaller subcomponents
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VersionDiffProps } from "../../blog/types";
import { TimelineSlider } from "./TimelineSlider";
import { VersionHeader } from "./VersionHeader";
import { DiffLine } from "./DiffLine";
import { DiffStats } from "./DiffStats";

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
      <DiffStats diffLines={diffLines} />
    </motion.div>
  );
}
