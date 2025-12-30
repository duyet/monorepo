type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',
} as const;

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

function log(level: LogLevel, prefix: string, message: string, ...args: unknown[]): void {
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
    debug: (message: string, ...args: unknown[]) => log('debug', prefix, message, ...args),
    info: (message: string, ...args: unknown[]) => log('info', prefix, message, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', prefix, message, ...args),
    error: (message: string, ...args: unknown[]) => log('error', prefix, message, ...args),
  };
}

export const logger = createLogger('data-sync');
