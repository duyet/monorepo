import { Bot, Code, Database, Server } from "lucide-react";

function StackGroupIcon({ icon }: { icon: string }) {
  const size = 18;
  if (icon === "code") return <Code size={size} />;
  if (icon === "server") return <Server size={size} />;
  if (icon === "bot") return <Bot size={size} />;
  // disk / default
  return <Database size={size} />;
}

export { StackGroupIcon };
