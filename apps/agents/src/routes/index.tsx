import { createFileRoute } from "@tanstack/react-router";
import ChatInterface from "@/components/chat-interface";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "AI Agents | Interactive AI Agent with Tools | duyet.net",
      },
      {
        name: "description",
        content:
          "Interactive AI agent with tools, compiled skills, and conversation export. Built with TanStack Start and Cloudflare.",
      },
      {
        property: "og:title",
        content: "AI Agents | Interactive AI Agent with Tools",
      },
      {
        property: "og:description",
        content:
          "Interactive AI agent with tools, compiled skills, and conversation export. Built with TanStack Start and Cloudflare.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://agents.duyet.net",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://agents.duyet.net",
      },
    ],
  }),
});

function HomePage() {
  return <ChatInterface />;
}
