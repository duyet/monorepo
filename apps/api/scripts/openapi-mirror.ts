import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { openApiDocument } from "../src/lib/openapi.js";

const target = resolve(import.meta.dirname, "../../home/public/openapi.json");

writeFileSync(target, `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.info(`wrote ${target}`);
