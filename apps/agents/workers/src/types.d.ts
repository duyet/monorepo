interface Ai {
  run(model: string, request: unknown, options?: unknown): Promise<unknown>;
}

declare interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

declare interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
}

declare interface DurableObjectNamespace<T = unknown> {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub<T>;
}

declare type DurableObjectId = {}

declare interface DurableObjectStub<T = unknown> {
  [key: string]: any;
}
