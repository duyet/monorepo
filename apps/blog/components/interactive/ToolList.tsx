import { useState, useMemo, ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@duyet/components";

export interface ToolItem {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  url?: string;
}

export interface ToolListProps {
  title?: string;
  tools: ToolItem[];
  categories?: string[];
}

/**
 * ToolList - Filterable grid with fuzzy search
 * Displays tools in a filterable grid with search and category filtering
 */
export function ToolList({ title = "Tool List", tools, categories }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fuzzy search implementation
  const fuzzyMatch = (text: string, pattern: string): boolean => {
    if (!pattern) return true;
    const searchText = text.toLowerCase();
    const searchPattern = pattern.toLowerCase();

    // Direct match
    if (searchText.includes(searchPattern)) return true;

    // Fuzzy match - check if characters appear in order
    let patternIdx = 0;
    for (let i = 0; i < searchText.length; i++) {
      if (searchText[i] === searchPattern[patternIdx]) {
        patternIdx++;
        if (patternIdx === searchPattern.length) return true;
      }
    }
    return false;
  };

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        fuzzyMatch(tool.name, searchTerm) ||
        fuzzyMatch(tool.description, searchTerm) ||
        (tool.tags && tool.tags.some((tag) => fuzzyMatch(tag, searchTerm)));

      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  const availableCategories = categories || [
    "All",
    ...Array.from(new Set(tools.map((t) => t.category))),
  ];

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools (fuzzy search enabled)..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTools.length} of {tools.length} tools
          {searchTerm && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No tools found. Try adjusting your search or filters.
          </div>
        ) : (
          filteredTools.map((tool, idx) => (
            <Card
              key={idx}
              className="transition-all hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
              onClick={() => tool.url && window.open(tool.url, "_blank")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {tool.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {tool.description}
                </p>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {tool.url && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Visit website →
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Sample data generator
export const sampleTools: ToolItem[] = [
  {
    name: "VS Code",
    description: "Lightweight but powerful source code editor",
    category: "Editor",
    tags: ["javascript", "typescript", "python"],
    url: "https://code.visualstudio.com",
  },
  {
    name: "Neovim",
    description: "Vim-fork focused on extensibility and usability",
    category: "Editor",
    tags: ["vim", "lua", "terminal"],
    url: "https://neovim.io",
  },
  {
    name: "Git",
    description: "Distributed version control system",
    category: "Version Control",
    tags: ["vcs", "cli"],
    url: "https://git-scm.com",
  },
  {
    name: "Docker",
    description: "Containerization platform for applications",
    category: "DevOps",
    tags: ["containers", "kubernetes", "deployment"],
    url: "https://docker.com",
  },
  {
    name: "PostgreSQL",
    description: "Advanced open-source relational database",
    category: "Database",
    tags: ["sql", "relational", "acid"],
    url: "https://postgresql.org",
  },
  {
    name: "Redis",
    description: "In-memory data structure store",
    category: "Database",
    tags: ["cache", "key-value", "in-memory"],
    url: "https://redis.io",
  },
  {
    name: "React",
    description: "JavaScript library for building user interfaces",
    category: "Framework",
    tags: ["frontend", "components", "jsx"],
    url: "https://react.dev",
  },
  {
    name: "Next.js",
    description: "React framework for production",
    category: "Framework",
    tags: ["ssr", "ssg", "react"],
    url: "https://nextjs.org",
  },
  {
    name: "Terraform",
    description: "Infrastructure as Code tool",
    category: "DevOps",
    tags: ["iac", "cloud", "provisioning"],
    url: "https://terraform.io",
  },
  {
    name: "Prometheus",
    description: "Monitoring and alerting toolkit",
    category: "DevOps",
    tags: ["monitoring", "metrics", "alerting"],
    url: "https://prometheus.io",
  },
  {
    name: "Figma",
    description: "Collaborative interface design tool",
    category: "Design",
    tags: ["ui", "ux", "prototyping"],
    url: "https://figma.com",
  },
  {
    name: "Postman",
    description: "API testing and development platform",
    category: "Tools",
    tags: ["api", "testing", "http"],
    url: "https://postman.com",
  },
];