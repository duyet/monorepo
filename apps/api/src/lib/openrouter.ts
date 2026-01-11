/**
 * OpenRouter API client for AI-powered content generation
 * @module lib/openrouter
 */

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface OpenRouterError {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * Fetch content from a URL
 * @param url - The URL to fetch content from
 * @returns The text content of the URL
 * @throws Error if fetching fails
 */
async function fetchContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }
    return await response.text();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
    throw new Error("Failed to fetch content: Unknown error");
  }
}

/**
 * Generate an AI description using OpenRouter API
 * @param content - The content to generate a description for
 * @param prompt - The system prompt to guide the AI
 * @returns The generated description or fallback text
 */
export async function generateDescription(
  content: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set, returning fallback description");
    return getFallbackDescription();
  }

  try {
    const requestBody: OpenRouterRequest = {
      model: "google/gemma-2-9b-it:free",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Content to describe:\n\n${content}` },
      ],
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://duyet.net",
          "X-Title": "duyet.net API",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as OpenRouterError;
      console.error(
        "OpenRouter API error:",
        errorData.error?.message || "Unknown error"
      );
      return getFallbackDescription();
    }

    const data = (await response.json()) as OpenRouterResponse;
    const description = data.choices[0]?.message?.content;

    if (!description) {
      console.warn("OpenRouter returned empty description");
      return getFallbackDescription();
    }

    return description.trim();
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    return getFallbackDescription();
  }
}

/**
 * Generate a description for the blog from llms.txt
 * @returns The generated blog description
 */
export async function generateBlogDescription(): Promise<string> {
  const blogPrompt = `You're a witty, fun assistant. Summarize this blog in 1-2 sentences that would make someone smile and want to click. Be clever but not cringe.`;

  try {
    const content = await fetchContent("https://blog.duyet.net/llms.txt");
    return await generateDescription(content, blogPrompt);
  } catch (error) {
    console.error("Error generating blog description:", error);
    return getFallbackDescription();
  }
}

/**
 * Generate a fun description for featured posts
 * @param featuredPosts - Array of featured post titles/slugs
 * @returns The generated featured description
 */
export async function generateFeaturedDescription(
  featuredPosts: string[]
): Promise<string> {
  const featuredPrompt = `You're a witty, fun assistant. Create a 1-2 sentence description for these featured blog posts that would make someone curious to read them. Be engaging but not over the top.`;

  const content = featuredPosts.map((post) => `- ${post}`).join("\n");
  return await generateDescription(content, featuredPrompt);
}

/**
 * Get a fallback description when AI generation fails
 * @returns A static fallback description
 */
function getFallbackDescription(): string {
  return "Thoughts, experiments, and explorations in software engineering, AI, and building things for the web.";
}
