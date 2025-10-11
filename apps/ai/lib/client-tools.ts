/**
 * Client-side tool handlers for ChatKit
 *
 * This module provides a registry pattern for handling client-side tool invocations
 * from the ChatKit workflow. Tools are functions that execute in the browser and
 * can perform actions like theme changes, data recording, etc.
 *
 * @module lib/client-tools
 */

import type { ColorScheme } from "@/hooks/useColorScheme";
import type { FactAction } from "@/components/ChatKitPanel";

// Re-export types for test usage
export type { FactAction };

/**
 * Result of a client tool execution
 *
 * @property success - Whether the tool executed successfully
 * @property error - Optional error message if execution failed
 */
export type ClientToolResult = {
  success: boolean;
  error?: string;
};

/**
 * Structure of a client tool invocation from ChatKit
 *
 * @property name - Unique identifier for the tool
 * @property params - Tool-specific parameters
 */
export type ClientToolInvocation = {
  name: string;
  params: Record<string, unknown>;
};

/**
 * Context object passed to client tool handlers
 *
 * This provides access to application state and callbacks that tools
 * can use to perform their operations.
 *
 * @property onThemeRequest - Callback to request theme change
 * @property onWidgetAction - Callback to perform widget-related actions
 * @property processedFacts - Set of already processed fact IDs (for deduplication)
 * @property isDev - Whether the app is running in development mode
 */
export type ClientToolContext = {
  onThemeRequest: (scheme: ColorScheme) => void;
  onWidgetAction: (action: FactAction) => Promise<void>;
  processedFacts: Set<string>;
  isDev: boolean;
};

/**
 * Type definition for a client tool handler function
 *
 * @param params - Tool-specific parameters from the invocation
 * @param context - Application context for performing actions
 * @returns Promise resolving to the tool execution result
 */
export type ClientToolHandler = (
  params: Record<string, unknown>,
  context: ClientToolContext,
) => Promise<ClientToolResult>;

/**
 * Registry of client tool handlers
 *
 * Maps tool names to their handler functions. This pattern allows for
 * easy addition of new tools without modifying the core component logic.
 */
const toolHandlers: Record<string, ClientToolHandler> = {};

/**
 * Registers a client tool handler
 *
 * @param name - Unique name for the tool
 * @param handler - Handler function to execute when tool is invoked
 *
 * @example
 * ```ts
 * registerClientTool('custom_action', async (params, context) => {
 *   // Perform custom action
 *   return { success: true }
 * })
 * ```
 */
export function registerClientTool(
  name: string,
  handler: ClientToolHandler,
): void {
  toolHandlers[name] = handler;
}

/**
 * Executes a client tool invocation
 *
 * @param invocation - Tool invocation details from ChatKit
 * @param context - Application context
 * @returns Promise resolving to the execution result
 *
 * @example
 * ```ts
 * const result = await executeClientTool(
 *   { name: 'switch_theme', params: { theme: 'dark' } },
 *   context
 * )
 * ```
 */
export async function executeClientTool(
  invocation: ClientToolInvocation,
  context: ClientToolContext,
): Promise<ClientToolResult> {
  const handler = toolHandlers[invocation.name];

  if (!handler) {
    return {
      success: false,
      error: `Unknown tool: ${invocation.name}`,
    };
  }

  try {
    return await handler(invocation.params, context);
  } catch (error) {
    console.error(`Error executing tool ${invocation.name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handler for the switch_theme client tool
 *
 * Changes the application theme between light and dark modes.
 *
 * @param params - Tool parameters containing theme value
 * @param context - Application context with onThemeRequest callback
 * @returns Execution result
 */
async function handleSwitchTheme(
  params: Record<string, unknown>,
  context: ClientToolContext,
): Promise<ClientToolResult> {
  const requested = params.theme;

  if (requested !== "light" && requested !== "dark") {
    return {
      success: false,
      error: `Invalid theme: ${requested}. Must be 'light' or 'dark'`,
    };
  }

  if (context.isDev) {
    console.debug("[ClientTool] switch_theme", requested);
  }

  context.onThemeRequest(requested);
  return { success: true };
}

/**
 * Handler for the record_fact client tool
 *
 * Records conversation facts with deduplication by fact_id.
 * Normalizes text by collapsing whitespace.
 *
 * @param params - Tool parameters containing fact_id and fact_text
 * @param context - Application context with onWidgetAction callback
 * @returns Execution result
 */
async function handleRecordFact(
  params: Record<string, unknown>,
  context: ClientToolContext,
): Promise<ClientToolResult> {
  const id = String(params.fact_id ?? "");
  const text = String(params.fact_text ?? "");

  if (!id) {
    return {
      success: false,
      error: "Missing fact_id parameter",
    };
  }

  // Deduplicate by fact_id
  if (context.processedFacts.has(id)) {
    return { success: true }; // Already processed, silently succeed
  }

  context.processedFacts.add(id);

  // Normalize text by collapsing whitespace
  const normalizedText = text.replace(/\s+/g, " ").trim();

  await context.onWidgetAction({
    type: "save",
    factId: id,
    factText: normalizedText,
  });

  return { success: true };
}

// Register default tools
registerClientTool("switch_theme", handleSwitchTheme);
registerClientTool("record_fact", handleRecordFact);

/**
 * Gets all registered tool names
 *
 * @returns Array of registered tool names
 *
 * @example
 * ```ts
 * const tools = getRegisteredTools()
 * console.log(tools) // ['switch_theme', 'record_fact']
 * ```
 */
export function getRegisteredTools(): string[] {
  return Object.keys(toolHandlers);
}
