type LogLevel = "debug" | "info" | "warn" | "error";

/** Ascending severity. A message is emitted when its level is >= the threshold. */
const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Minimum level to emit, from `LOG_LEVEL`.
 *
 * The default is `debug`, which is what this logger has always done — every
 * level printed unconditionally. `LOG_LEVEL` was documented in `CLAUDE.md` as
 * the way to get verbose output, but nothing read it, so the documented flag was
 * a no-op. Defaulting to `debug` means setting it now *only ever removes*
 * output: `LOG_LEVEL=info` silences the per-batch `debug` lines, and nothing
 * that was previously visible disappears unless asked for.
 */
function threshold(): number {
  const configured = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (configured && configured in LEVEL_RANK) {
    return LEVEL_RANK[configured as LogLevel];
  }
  // An unrecognized value is a typo, not a request to go quiet. Fall back to
  // the historical behavior rather than silently swallowing every log line.
  //
  // Warned once per distinct value: `threshold()` runs on every message, and a
  // warning per line would bury the log it is trying to explain.
  if (configured && !warnedAbout.has(configured)) {
    warnedAbout.add(configured);
    console.warn(
      `[logger] ignoring LOG_LEVEL="${configured}": expected one of debug, info, warn, error`,
    );
  }
  return LEVEL_RANK.debug;
}

const warnedAbout = new Set<string>();

interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const COLORS = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  reset: "\x1b[0m",
} as const;

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

function log(
  level: LogLevel,
  prefix: string,
  message: string,
  ...args: unknown[]
): void {
  if (LEVEL_RANK[level] < threshold()) return;

  const timestamp = formatTimestamp();
  const color = COLORS[level];
  const levelStr = level.toUpperCase().padEnd(5);

  console.log(
    `[${timestamp}] ${color}[${levelStr}]${COLORS.reset} [${prefix}] ${message}`,
    ...args
  );
}

export function createLogger(prefix: string): Logger {
  return {
    debug: (message: string, ...args: unknown[]) =>
      log("debug", prefix, message, ...args),
    info: (message: string, ...args: unknown[]) =>
      log("info", prefix, message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      log("warn", prefix, message, ...args),
    error: (message: string, ...args: unknown[]) =>
      log("error", prefix, message, ...args),
  };
}

export const logger = createLogger("data-sync");
