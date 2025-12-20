/**
 * Environment variables for the CV app
 * See @duyet/interfaces for shared environment type definitions
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    // Common variables (from CommonEnvironmentVariables)
    readonly NODE_ENV: "development" | "production" | "test";
    readonly NEXT_PUBLIC_MEASUREMENT_ID: string;
  }
}
