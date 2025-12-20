/**
 * Mock for Vercel KV Redis client
 * Used for testing comment storage and retrieval
 */

export interface MockKVStore {
  [key: string]: any;
}

class MockVercelKV {
  private store: MockKVStore = {};

  async get<T = any>(key: string): Promise<T | null> {
    return (this.store[key] as T) || null;
  }

  async set(
    key: string,
    value: any,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }
  ): Promise<"OK"> {
    this.store[key] = value;
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (key in this.store) {
        delete this.store[key];
        count++;
      }
    }
    return count;
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((key) => key in this.store).length;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      `^${pattern.replace(/\*/g, ".*").replace(/\?/g, ".")}$`
    );
    return Object.keys(this.store).filter((key) => regex.test(key));
  }

  async lrange<T = any>(
    key: string,
    start: number,
    stop: number
  ): Promise<T[]> {
    const list = (this.store[key] as T[]) || [];
    if (stop === -1) {
      return list.slice(start);
    }
    return list.slice(start, stop + 1);
  }

  async lpush<T = any>(key: string, ...values: T[]): Promise<number> {
    if (!this.store[key]) {
      this.store[key] = [];
    }
    const list = this.store[key] as T[];
    list.unshift(...values);
    return list.length;
  }

  async rpush<T = any>(key: string, ...values: T[]): Promise<number> {
    if (!this.store[key]) {
      this.store[key] = [];
    }
    const list = this.store[key] as T[];
    list.push(...values);
    return list.length;
  }

  async incr(key: string): Promise<number> {
    if (!this.store[key]) {
      this.store[key] = 0;
    }
    this.store[key] = (this.store[key] as number) + 1;
    return this.store[key] as number;
  }

  async decr(key: string): Promise<number> {
    if (!this.store[key]) {
      this.store[key] = 0;
    }
    this.store[key] = (this.store[key] as number) - 1;
    return this.store[key] as number;
  }

  // Test helper methods
  _clear(): void {
    this.store = {};
  }

  _getStore(): MockKVStore {
    return { ...this.store };
  }

  _setStore(store: MockKVStore): void {
    this.store = { ...store };
  }
}

export const createMockKV = (): MockVercelKV => new MockVercelKV();

// Default export for jest.mock()
export default createMockKV();
