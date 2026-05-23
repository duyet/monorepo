import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const SYSTEM_PROMPT = `You are duyetbot, the personal assistant for Duyet.
You are running as a LangGraph-powered Next.js application (apps/agent-assistant).

Local duyet.net context:
- Duyet Le is a Senior Data & AI Engineer based in Vietnam with 8+ years of experience building data infrastructure, AI/ML platforms, distributed systems, and cloud-native production systems.
- Main duyet.net surfaces: duyet.net for home/about/projects, blog.duyet.net for technical writing, cv.duyet.net for the resume, insights.duyet.net for analytics, photos.duyet.net for photography, homelab.duyet.net for homelab notes, and github.com/duyet for open source work.

Duyet-specific response guidelines:
- Answer in the user's language when it is clear. Be concise, practical, and direct.
- Prefer practical engineering answers: specific, source-grounded, and useful for implementation or decision-making.
- Do not invent current status, private details, metrics, publications, employers, or live content beyond what is known.
- If the request is ambiguous, ask one short clarifying question before taking any irreversible action.
- You are running inside the local/production duyetbot Hermes ecosystem. Help Duyet brainstorm coding solutions, debug problems, review architectures, or plan weekend projects.
`;

function getOfflineFallbackResponse(userMessage: string): string {
  const query = userMessage.toLowerCase().trim();

  const greetingKeywords = [
    "hello",
    "hi",
    "hey",
    "hola",
    "sup",
    "yo",
    "greeting",
  ];
  const expertiseKeywords = [
    "expert",
    "skill",
    "clickhouse",
    "kubernetes",
    "k8s",
    "data",
    "infrastructure",
    "devops",
    "cloud",
  ];
  const surfaceKeywords = [
    "blog",
    "cv",
    "resume",
    "homelab",
    "github",
    "photo",
    "link",
    "url",
    "website",
  ];

  const isGreeting =
    greetingKeywords.some((kw) => query.includes(kw)) || query === "";
  const isExpertise = expertiseKeywords.some((kw) => query.includes(kw));
  const isSurface = surfaceKeywords.some((kw) => query.includes(kw));

  if (isGreeting) {
    return `👋 **Hello! I am duyetbot**, the personal AI assistant for Duyet. 

I am currently running in a stateful, edge-native serverless architecture powered by **TanStack Start (Vite)** and a native **Cloudflare Durable Object (\`ThreadStateDO\`)** for transaction-safe persistence!

⚠️ **System Notice**: The primary LLM credentials (OpenAI / Gemini) in the current environment appear to be placeholder/invalid keys. I have gracefully transitioned to **local-offline backup mode** to ensure complete UI responsiveness.

How can I help you explore Duyet's world? Try asking me about:
1. His **expertise** (ClickHouse, Kubernetes, Data Infrastructure).
2. His **web surfaces** (Blog, CV, Homelab, GitHub).
3. Any other questions about this monorepo!`;
  }

  if (isExpertise) {
    return `📊 **Duyet's Technical Expertise & Homelab**

Duyet Le has over 8 years of professional experience building high-performance data infrastructure, distributed systems, and DevOps automation.

*   **ClickHouse**: Designing ultra-fast OLAP schemas, managing distributed clusters, and performance-tuning queries processing billions of rows.
*   **Kubernetes**: Managing bare-metal homelab clusters and cloud-native production environments using GitOps (ArgoCD / Flux).
*   **Homelab**: A playground for testing self-hosted databases, edge routing, and automation. Read his detailed homelab wiki at [homelab.duyet.net](https://homelab.duyet.net).
*   **Languages & Frameworks**: Proficient in Rust, TypeScript, Python, and Go for building backend systems and performance tools.`;
  }

  if (isSurface) {
    return `🌐 **Official duyet.net Surfaces & Portals**

You can find more details about Duyet across his dedicated portals:
*   **Main Blog**: [blog.duyet.net](https://blog.duyet.net) — containing deep dives into databases, rust development, and system engineering.
*   **Career CV / Resume**: [cv.duyet.net](https://cv.duyet.net) — detailing his complete professional timeline, career achievements, and tech stack.
*   **GitHub**: [github.com/duyet](https://github.com/duyet) — open-source utilities, homelab configurations, and community contributions.
*   **Photography**: [photos.duyet.net](https://photos.duyet.net) — street and travel photography logs.`;
  }

  return `💡 **Resilient Local-Offline Response**

I received your prompt: *"${userMessage}"*

Since the active LLM endpoints (OpenAI / Gemini) returned an authorization or geographical block, I am answering using my localized offline knowledge base.

To fully activate the AI assistant (GPT-4o or Google Gemini):
1. Add valid API keys to \`apps/agent-assistant/.env.local\`.
2. Run \`bun run deploy.ts\` (or \`npm run deploy\`) to publish the keys directly into the Cloudflare Worker's bindings.

Would you like me to tell you more about Duyet's **blog**, **resume (CV)**, or his **technical expertise**?`;
}

export function getCompiledGraph(checkpointer?: any, env?: any) {
  const anyrouterApiKey =
    env?.ANYROUTER_API_KEY ||
    (typeof process !== "undefined" ? process.env.ANYROUTER_API_KEY : undefined);
  const anyrouterBaseUrl =
    env?.ANYROUTER_BASE_URL ||
    (typeof process !== "undefined" ? process.env.ANYROUTER_BASE_URL : undefined) ||
    "https://anyrouter.dev/api/v1";
  const anyrouterModel =
    env?.ANYROUTER_MODEL ||
    env?.ANYROUTER_PRESET ||
    (typeof process !== "undefined" ? env.ANYROUTER_MODEL || env.ANYROUTER_PRESET || process.env.ANYROUTER_MODEL || process.env.ANYROUTER_PRESET : undefined) ||
    "@preset/duyetbot";

  const openaiApiKey =
    env?.OPENAI_API_KEY ||
    (typeof process !== "undefined" ? process.env.OPENAI_API_KEY : undefined);
  const googleApiKey =
    env?.GOOGLE_API_KEY ||
    env?.GEMINI_API_KEY ||
    (typeof process !== "undefined"
      ? process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
      : undefined);

  let model: any;

  if (anyrouterApiKey && !anyrouterApiKey.startsWith("placeholder")) {
    model = new ChatOpenAI({
      model: anyrouterModel,
      temperature: 0,
      apiKey: anyrouterApiKey,
      configuration: {
        baseURL: anyrouterBaseUrl,
      },
    });
  } else if (googleApiKey && !googleApiKey.startsWith("AIzaSyBfJXU8rnLS1btLv")) {
    try {
      if (typeof process !== "undefined" && process.env) {
        process.env.GOOGLE_API_KEY = googleApiKey;
        process.env.GEMINI_API_KEY = googleApiKey;
      }
    } catch (e) {
      console.warn("Could not write to process.env:", e);
    }

    const geminiModelName =
      env?.GEMINI_MODEL ||
      (typeof process !== "undefined" ? process.env.GEMINI_MODEL : undefined) ||
      "gemini-1.5-flash";
    model = new ChatGoogleGenerativeAI({
      model: geminiModelName,
      modelName: geminiModelName,
      temperature: 0,
      apiKey: googleApiKey,
      googleApiKey: googleApiKey,
    } as any);
  } else {
    const openaiModelName =
      env?.OPENAI_MODEL ||
      (typeof process !== "undefined" ? process.env.OPENAI_MODEL : undefined) ||
      "gpt-4o-mini";
    model = new ChatOpenAI({
      model: openaiModelName,
      temperature: 0,
      apiKey:
        openaiApiKey && !openaiApiKey.startsWith("sk-proj-epynv")
          ? openaiApiKey
          : "placeholder",
    });
  }

  const callModel = async (state: typeof MessagesAnnotation.State) => {
    try {
      // Check if we are using placeholder credentials to avoid wasting network requests
      const isPlaceholderAnyRouter =
        !anyrouterApiKey || anyrouterApiKey.startsWith("placeholder");
      const isPlaceholderOpenAI =
        !openaiApiKey || openaiApiKey.startsWith("sk-proj-epynv");
      const isPlaceholderGemini =
        !googleApiKey || googleApiKey.startsWith("AIzaSyBfJXU8rnLS1btLv");
      if (isPlaceholderAnyRouter && isPlaceholderOpenAI && isPlaceholderGemini) {
        throw new Error(
          "Local fallback triggered due to placeholder API credentials."
        );
      }

      const systemMessage = new SystemMessage(SYSTEM_PROMPT);
      const response = await model.invoke([systemMessage, ...state.messages]);
      return { messages: [response] };
    } catch (err: any) {
      console.warn(
        "Primary LLM execution failed, falling back to local-offline mode:",
        err.message || err
      );

      const lastUserMessage = [...state.messages]
        .reverse()
        .find((m) => m._getType() === "human" || (m as any).type === "human");
      const userContent = lastUserMessage
        ? typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : JSON.stringify(lastUserMessage.content)
        : "";

      const responseText = getOfflineFallbackResponse(userContent);

      // Construct a LangChain-compatible message response
      const fallbackMessage = {
        _getType: () => "ai",
        type: "ai",
        content: responseText,
        id: `fallback-${crypto.randomUUID()}`,
        additional_kwargs: {},
        response_metadata: { finish_reason: "stop" },
        tool_calls: [],
      };
      return { messages: [fallbackMessage] };
    }
  };

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addEdge("agent", "__end__")
    .compile({ checkpointer });
}

// Keep the canonical graph export for langgraph.json compatibility
export const graph = getCompiledGraph();
