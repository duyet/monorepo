import React, { useState } from "react";
import { useDebounce } from "use-debounce";

interface ToolListProps {
  tools: Array<{
    name: string;
    category: string;
    description: string;
    tags: string[];
  }>;
}

export const ToolList: React.FC<ToolListProps> = ({ tools }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const categories = ["all", ...new Set(tools.map(tool => tool.category))];

  const fuzzySearch = (text: string, pattern: string) => {
    const patternLower = pattern.toLowerCase();
    const textLower = text.toLowerCase();
    return textLower.includes(patternLower);
  };

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch = debouncedSearchTerm === "" ||
      fuzzySearch(tool.name, debouncedSearchTerm) ||
      fuzzySearch(tool.description, debouncedSearchTerm) ||
      tool.tags.some(tag => fuzzySearch(tag, debouncedSearchTerm));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Tool List</h3>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-1">{tool.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{tool.category}</p>
              <p className="text-sm mb-3">{tool.description}</p>
              <div className="flex flex-wrap gap-1">
                {tool.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No tools found matching your criteria.
          </div>
        )}
      </div>
      <div className="mt-4 text-right text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredTools.length} of {tools.length} tools
      </div>
    </div>
  );
};