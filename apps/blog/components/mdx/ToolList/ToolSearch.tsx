// Search bar component for tools
import { Search } from "lucide-react";

interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <div className="mb-6">
      <label htmlFor="tool-search" className="sr-only">
        Search tools
      </label>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <input
          id="tool-search"
          type="text"
          placeholder="Search tools by name, category, or notes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Search tools"
        />
      </div>
    </div>
  );
}
