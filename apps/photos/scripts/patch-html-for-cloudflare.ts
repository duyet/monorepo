import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist", "client");

function patchHtmlFiles(dir: string) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      patchHtmlFiles(filePath);
      continue;
    }

    if (!filePath.endsWith(".html")) {
      continue;
    }

    const original = readFileSync(filePath, "utf8");
    const updated = original.replace(
      /<script\b(?![^>]*\bdata-cfasync=)/g,
      '<script data-cfasync="false"'
    );

    if (updated !== original) {
      writeFileSync(filePath, updated);
      console.log(`Patched Rocket Loader opt-out in ${filePath}`);
    }
  }
}

patchHtmlFiles(distDir);
