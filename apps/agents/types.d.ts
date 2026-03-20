/// <reference types="vite/client" />

// Cloudflare Pages Function types
declare interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: Array<Promise<unknown>>): Promise<Array<unknown>>;
  dump(): Promise<ArrayBuffer>;
  exec(statement: string, params?: unknown[]): Promise<unknown>;
}

declare interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all(): Promise<{ results: unknown[] }>;
  run(): Promise<{
    success: boolean;
    meta?: { last_row_id?: number; duration?: number };
  }>;
}

declare interface Ai {
  run(model: string, request: unknown): Promise<unknown>;
}
