// Version metadata header component
import { motion } from "framer-motion";
import { GitCommit, Calendar, Clock } from "lucide-react";
import type { Version } from "../../blog/types";

interface VersionHeaderProps {
  version: Version;
  isUpcoming: boolean;
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

export function VersionHeader({ version, isUpcoming }: VersionHeaderProps) {
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
          {isUpcoming && (
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
