/**
 * System prompts for the AI agent
 *
 * Extracted from lib/agent.ts to match the template's module organization.
 * Re-exports existing prompts so other modules can import from here.
 */

export { FAST_SYSTEM_PROMPT, SYSTEM_PROMPT } from "../agent";

/**
 * Build system prompt with skills and user settings.
 *
 * @param basePrompt - The base system prompt (SYSTEM_PROMPT or FAST_SYSTEM_PROMPT)
 * @param skills - Optional agent skills to inject
 * @param settings - Optional user preference settings
 */
export function buildSystemPrompt(
  basePrompt: string,
  skills?: Array<{
    metadata: { name: string; description: string };
    content: string;
  }>,
  settings?: {
    customInstructions?: string;
    language?: string;
    timezone?: string;
  }
): string {
  let system = basePrompt;

  if (skills && skills.length > 0) {
    const skillsXml = skills
      .map(
        (skill) =>
          `  <skill>\n    <name>${skill.metadata.name}</name>\n    <description>${skill.metadata.description.trim()}</description>\n    <content>\n${skill.content}\n    </content>\n  </skill>`
      )
      .join("\n");
    system += `\n\n<available_skills>\n${skillsXml}\n</available_skills>`;
  }

  if (settings) {
    const parts: string[] = [];
    if (settings.customInstructions) {
      const sanitized = sanitizeUserString(settings.customInstructions, 500);
      if (sanitized) parts.push(`User Custom Instructions:\n${sanitized}`);
    }
    if (settings.language) {
      const sanitized = sanitizeUserString(settings.language, 50);
      if (sanitized)
        parts.push(`The user's preferred language is: ${sanitized}`);
    }
    if (settings.timezone) {
      const sanitized = sanitizeUserString(settings.timezone, 50);
      if (sanitized)
        parts.push(`The user's current timezone is: ${sanitized}`);
    }

    if (parts.length > 0) {
      system += `\n\n--- User Preferences ---\n${parts.join("\n\n")}\n------------------------`;
    }
  }

  return system;
}

/**
 * Sanitize a user-supplied string before injecting into the system prompt.
 */
function sanitizeUserString(value: string, maxLen: number): string {
  const truncated = value.substring(0, maxLen);
  return truncated
    .replace(
      /<\/?(?:system|assistant|user|human|prompt|instruction)[^>]*>/gi,
      ""
    )
    .replace(/^\s*(?:system|assistant|human|user)\s*:/gim, "")
    .trim();
}
