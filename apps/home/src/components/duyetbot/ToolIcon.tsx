import {
  BookOpen,
  Code,
  Database,
  Download,
  Layers,
  Link as LinkIcon,
  Server,
} from "lucide-react";

function ToolIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  switch (icon) {
    case "book":
      return <BookOpen size={size} />;
    case "dl":
      return <Download size={size} />;
    case "disk":
      return <Database size={size} />;
    case "server":
      return <Server size={size} />;
    case "layers":
      return <Layers size={size} />;
    case "link":
      return <LinkIcon size={size} />;
    default:
      return <Code size={size} />;
  }
}

export { ToolIcon };
