/// <reference types="vite/client" />

// Type declarations for bun:test (used in test files)
declare module "bun:test" {
  export interface Mock {
    module(module: string, factory: () => unknown): void;
  }
  export const mock: Mock;
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export interface Expect {
    (
      value: unknown
    ): {
      toBeDefined(): void;
      toBeNull(): void;
      toHaveLength(n: number): void;
      toContain(str: string): void;
      toBe(value: unknown): void;
      toHaveElements(): void;
    };
    extend(
      matchers: Record<
        string,
        (...args: unknown[]) => { pass: boolean; message: () => string }
      >
    ): void;
  }
  export const expect: Expect;
  export function afterEach(fn: () => void | Promise<void>): void;
}
