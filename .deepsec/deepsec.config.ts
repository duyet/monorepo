import { defineConfig } from "deepsec/config";

export default defineConfig({
  projects: [
    { id: "monorepo", root: ".." },
    // <deepsec:projects-insert-above>
  ],
});
