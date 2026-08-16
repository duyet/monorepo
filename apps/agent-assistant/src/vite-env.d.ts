/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSISTANT_API_TOKEN?: string;
  readonly VITE_LANGGRAPH_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
