import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(join(process.cwd(), "package.json"));

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === "react" ||
    specifier.startsWith("react/") ||
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/")
  ) {
    try {
      return {
        url: pathToFileURL(require.resolve(specifier)).href,
        shortCircuit: true,
      };
    } catch {
      // fall through
    }
  }
  return nextResolve(specifier, context);
}
