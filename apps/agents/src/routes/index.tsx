import { createFileRoute } from "@tanstack/react-router";
import ChatInterface from "@/components/chat-interface";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <ChatInterface />;
}
