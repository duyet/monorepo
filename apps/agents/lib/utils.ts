import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export auth utilities from utils/auth.ts
export { getAuthHeaders } from "./utils/auth";

import { ChatbotError, type ErrorCode } from "./errors";

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function sanitizeText(text: string): string {
  return text.replace("<has_function_call>", "");
}

async function throwResponseError(response: Response): Promise<never> {
  try {
    const { code, cause } = await response.json();
    throw new ChatbotError(code as ErrorCode, cause);
  } catch (e) {
    if (e instanceof ChatbotError) throw e;
    throw new Error(`Request failed: ${response.status}`);
  }
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) await throwResponseError(response);
  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) await throwResponseError(response);
    return response;
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatbotError("offline:chat");
    }
    throw error;
  }
}
