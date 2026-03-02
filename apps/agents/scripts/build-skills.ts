/**
 * Build Script for Agent Skills Integration
 *
 * This script recursively loads `SKILL.md` files from the `skills/` directory,
 * parses their YAML frontmatter and content, and outputs a static JSON data
 * structure to `lib/skills-data.ts`.
 *
 * This allows the Cloudflare Pages `workerd` runtime to inject <available_skills>
 * into the AI agent prompt without requiring native file system access.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import yaml from "yaml";

const SKILLS_DIR = join(process.cwd(), "skills");
const OUTPUT_FILE = join(process.cwd(), "lib", "skills-data.ts");

interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  "allowed-tools"?: string[];
}

interface SkillContext {
  metadata: SkillMetadata;
  content: string;
}

function parseMarkdownFrontmatter(fileContent: string): {
  metadata: SkillMetadata;
  content: string;
} {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(
      "Invalid SKILL.md format: Missing or malformed YAML frontmatter (---)"
    );
  }

  const [_, yamlBlock, contentBlock] = match;
  const metadata = yaml.parse(yamlBlock) as SkillMetadata;

  if (!metadata.name || !metadata.description) {
    throw new Error(
      "SKILL.md frontmatter must contain 'name' and 'description'"
    );
  }

  return { metadata, content: contentBlock.trim() };
}

function run() {
  console.log("[build-skills] Starting skill compilation...");

  if (!existsSync(SKILLS_DIR)) {
    console.warn(
      `[build-skills] Warning: Skills directory not found at ${SKILLS_DIR}`
    );
    writeFileSync(
      OUTPUT_FILE,
      `// Auto-generated file. Do not edit.\nexport const AGENT_SKILLS = [];\n`
    );
    return;
  }

  const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skills: SkillContext[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = join(SKILLS_DIR, entry.name, "SKILL.md");

      if (existsSync(skillPath)) {
        console.log(`[build-skills] ↳ Compiling skill: ${entry.name}`);
        try {
          const rawContent = readFileSync(skillPath, "utf-8");
          const { metadata, content } = parseMarkdownFrontmatter(rawContent);

          if (metadata.name !== entry.name) {
            console.warn(
              `[build-skills] Warning: Skill name '${metadata.name}' inside SKILL.md does not match directory name '${entry.name}'. AgentSkills spec recommends they match.`
            );
          }

          skills.push({ metadata, content });
        } catch (err) {
          console.error(`[build-skills] ❌ Error parsing ${skillPath}:`, err);
          process.exit(1);
        }
      }
    }
  }

  const fileOutput = `// Auto-generated file by scripts/build-skills.ts. Do not edit.
export const AGENT_SKILLS = ${JSON.stringify(skills, null, 2)};
`;

  writeFileSync(OUTPUT_FILE, fileOutput, "utf-8");
  console.log(
    `[build-skills] ✅ Successfully compiled ${skills.length} skill(s) into ${OUTPUT_FILE}`
  );
}

run();
