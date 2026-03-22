/**
 * Environment variables for the CV app
 */
interface ImportMetaEnv {
  readonly VITE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
