import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@duyet/components/ui/card';
import { Input } from '@duyet/components/ui/input';
import { Badge } from '@duyet/components/ui/badge';
import { Button } from '@duyet/components/ui/button';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '@duyet/libs/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  url?: string;
  featured?: boolean;
}

interface ToolListProps {
  tools: Tool[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
}

export function ToolList({ tools, title = "Tools Directory", searchable = true, filterable = true }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(tools.map(tool => tool.category));
    return Array.from(categorySet).sort();
  }, [tools]);

  // Filter and search
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchTerm ||
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !selectedCategory || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  // Group by category
  const toolsByCategory = useMemo(() => {
    const groups: Record<string, Tool[]> = {};
    filteredTools.forEach(tool => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const toggleExpand = (toolName: string) => {
    setExpandedTool(expandedTool === toolName ? null : toolName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary" className="text-sm">
            {filteredTools.length} tools
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col gap-3">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {filterable && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Tools list */}
        {Object.entries(toolsByCategory).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tools found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {category}
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  <span className="text-xs">{categoryTools.length}</span>
                </div>

                <div className="space-y-2">
                  {categoryTools.map((tool, index) => {
                    const isExpanded = expandedTool === tool.name;

                    return (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border rounded-lg p-3 transition-all",
                          isExpanded ? "border-primary shadow-sm" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 mt-0.5"
                            onClick={() => toggleExpand(tool.name)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium truncate">{tool.name}</div>
                              <div className="flex items-center gap-1">
                                {tool.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-[10px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground truncate">
                              {tool.description}
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t space-y-2"
                                >
                                  <div className="text-sm">
                                    <strong>Category:</strong> {tool.category}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {tool.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  {tool.url && (
                                    <a
                                      href={tool.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                      Visit Website →
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {tool.featured && (
                            <Badge className="hidden sm:flex" variant="default">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}