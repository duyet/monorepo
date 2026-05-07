const isServer = typeof window === "undefined";

export async function readPublicJson<T>(path: string): Promise<T> {
  if (isServer) {
    const { readFileSync, existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const baseDir = import.meta.dirname ?? process.cwd();
    const candidates = [
      join(baseDir, "..", "public", path),
      join(baseDir, "..", "client", path),
      join(process.cwd(), "public", path),
    ];
    const filePath = candidates.find((p) => existsSync(p));
    if (!filePath) throw new Error(`Public file not found: ${path}`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  }
  const res = await fetch(`/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}
