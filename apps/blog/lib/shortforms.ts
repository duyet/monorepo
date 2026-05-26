const FILES = import.meta.glob("/_shortforms/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface Shortform {
  id: string;
  date: Date;
  body: string;
}

/** Parse the minimal frontmatter used in shortforms (only `date:` is needed). */
function parseFrontmatter(raw: string): { date: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { date: "", body: raw.trim() };
  }
  const [, fm, content] = match;
  const dateMatch = fm.match(/^date:\s*(.+)$/m);
  return {
    date: dateMatch ? dateMatch[1].trim() : "",
    body: content.trim(),
  };
}

export function getShortforms(limit?: number): Shortform[] {
  const all: Shortform[] = Object.entries(FILES).map(([path, raw]) => {
    const id = path.split("/").pop()!.replace(/\.md$/, "");
    const { date, body } = parseFrontmatter(raw);
    return {
      id,
      date: new Date(date),
      body,
    };
  });
  all.sort((a, b) => b.date.getTime() - a.date.getTime());
  return limit ? all.slice(0, limit) : all;
}
