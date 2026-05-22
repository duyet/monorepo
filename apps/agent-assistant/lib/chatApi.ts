import { Client } from "@langchain/langgraph-sdk";

export const createClient = () => {
  const apiUrl =
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_LANGGRAPH_API_URL
      : undefined) ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_LANGGRAPH_API_URL
      : undefined) ||
    (typeof window !== "undefined"
      ? new URL("/api", window.location.href).href
      : "/api");
  return new Client({ apiUrl });
};
