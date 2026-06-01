import {
  BookOpen,
  Bot,
  Code,
  Cpu,
  Database,
  FolderKanban,
  GitBranch,
  Newspaper,
  Server,
  Wrench,
  Zap,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Database> = {
  Data: Database,
  "Data Engineering": Database,
  Rust: Cpu,
  AI: Bot,
  "Machine Learning": Bot,
  Web: Code,
  Javascript: Code,
  Kubernetes: Server,
  Infrastructure: Server,
  Linux: Server,
  Airflow: GitBranch,
  Git: GitBranch,
  Story: BookOpen,
  News: Newspaper,
  Project: FolderKanban,
  Productivity: Zap,
  "Software Engineering": Wrench,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? BookOpen;
}

export { CATEGORY_ICONS, getCategoryIcon };
