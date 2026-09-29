import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createLogger } from "../logger";

/**
 * `LOG_LEVEL` is documented in `CLAUDE.md` as the way to control verbosity but
 * nothing read it, so the documented flag did nothing. These pin the fixed
 * behavior, with `debug` as the default specifically so that honoring the
 * variable can only ever remove output, never add or hide it silently.
 */

let emitted: string[];
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  emitted = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    emitted.push(String(args[0]));
  });
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const log = (level: "debug" | "info" | "warn" | "error") =>
  createLogger("t")[level](`msg-${level}`);

describe("LOG_LEVEL", () => {
  test("defaults to debug, so every level prints (the historical behavior)", () => {
    vi.stubEnv("LOG_LEVEL", undefined);
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(4);
  });

  test("info silences debug and keeps the rest", () => {
    vi.stubEnv("LOG_LEVEL", "info");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(3);
    expect(emitted.join("\n")).not.toContain("msg-debug");
  });

  test("warn silences debug and info", () => {
    vi.stubEnv("LOG_LEVEL", "warn");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(2);
  });

  test("error emits only errors", () => {
    vi.stubEnv("LOG_LEVEL", "error");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toContain("msg-error");
  });

  test("debug is an explicit no-op filter, matching the default", () => {
    vi.stubEnv("LOG_LEVEL", "debug");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(4);
  });

  test("is case-insensitive and tolerates surrounding whitespace", () => {
    vi.stubEnv("LOG_LEVEL", "  WARN  ");
    log("info");
    log("warn");
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toContain("msg-warn");
  });

  test("an unrecognized value warns and falls back to debug rather than going quiet", () => {
    // A typo must not silently swallow every log line — that is the failure
    // mode that makes a broken pipeline look like a healthy one.
    vi.stubEnv("LOG_LEVEL", "verbose");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(4);
    // Warned once, not once per line: `threshold()` runs per message, and a
    // warning per line would bury the log it is explaining.
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain('LOG_LEVEL="verbose"');
  });

  test("an empty value is not a typo", () => {
    vi.stubEnv("LOG_LEVEL", "");
    for (const level of ["debug", "info", "warn", "error"] as const) log(level);
    expect(emitted).toHaveLength(4);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("output format", () => {
  test("keeps the timestamp/level/prefix shape, and passes extra args through", () => {
    vi.stubEnv("LOG_LEVEL", undefined);
    const extra = { rows: 3 };
    vi.mocked(console.log).mockClear();
    createLogger("wakatime").info("Inserting batch", extra);

    expect(vi.mocked(console.log)).toHaveBeenCalledOnce();
    const [line, ...rest] = vi.mocked(console.log).mock.calls[0];
    expect(line).toMatch(
      /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \x1b\[32m\[INFO \]\x1b\[0m \[wakatime\] Inserting batch$/,
    );
    expect(rest).toEqual([extra]);
  });

  test("each level gets its own color and is padded to 5 characters", () => {
    vi.stubEnv("LOG_LEVEL", undefined);
    for (const [level, color] of [
      ["debug", "\x1b[36m"],
      ["info", "\x1b[32m"],
      ["warn", "\x1b[33m"],
      ["error", "\x1b[31m"],
    ] as const) {
      vi.mocked(console.log).mockClear();
      log(level);
      expect(vi.mocked(console.log).mock.calls[0][0]).toContain(
        `${color}[${level.toUpperCase().padEnd(5)}]`,
      );
    }
  });
});
