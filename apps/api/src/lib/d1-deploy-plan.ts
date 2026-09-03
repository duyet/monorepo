const D1_DATABASE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SKIP_D1_REASON =
  "skip D1 bind and remote migrations: wrangler.toml has no database_id UUID";

export interface ProductionDeployPlan {
  toml: string;
  stripD1: boolean;
  applyMigrations: boolean;
  reason: string;
}

interface TomlSection {
  header: string | null;
  raw: string;
}

export function isD1DatabaseId(value: string): boolean {
  return D1_DATABASE_ID.test(value.trim());
}

function quotedValue(body: string, key: string): string | undefined {
  const match = body.match(
    new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"\\s*$`, "m")
  );
  return match?.[1];
}

function parseTomlSections(toml: string): TomlSection[] {
  const lines = toml.split("\n");
  const sections: TomlSection[] = [];
  let header: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (header === null && buf.length === 0) {
      return;
    }
    sections.push({ header, raw: buf.join("\n") });
    buf = [];
  };

  for (const line of lines) {
    if (/^\s*\[/.test(line)) {
      flush();
      header = line.trim();
      buf = [line];
      continue;
    }
    buf.push(line);
  }
  flush();
  return sections;
}

function joinSections(sections: TomlSection[]): string {
  const joined = sections
    .map((section) => section.raw.replace(/\n+$/u, ""))
    .filter((raw) => raw.length > 0)
    .join("\n\n");
  return `${joined.trimEnd()}\n`;
}

export function planProductionDeploy(toml: string): ProductionDeployPlan {
  const sections = parseTomlSections(toml);
  let stripD1 = false;
  const kept: TomlSection[] = [];

  for (const section of sections) {
    if (section.header === "[[d1_databases]]") {
      const id = quotedValue(section.raw, "database_id");
      if (!id || !isD1DatabaseId(id)) {
        stripD1 = true;
        continue;
      }
    }
    kept.push(section);
  }

  const applyMigrations = kept.some(
    (section) => section.header === "[[d1_databases]]"
  );
  return {
    toml: joinSections(kept),
    stripD1,
    applyMigrations,
    reason: stripD1
      ? SKIP_D1_REASON
      : "bind SUBMISSIONS_DB and apply remote migrations",
  };
}
