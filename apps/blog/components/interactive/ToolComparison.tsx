import React from "react";

interface Tool {
  name: string;
  pros: string[];
  cons: string[];
  rating: number; // 0-5
}

interface ToolComparisonProps {
  title: string;
  tools: Tool[];
}

/**
 * ToolComparison - Card-based tool comparison with pros/cons and ratings
 */
export const ToolComparison: React.FC<ToolComparisonProps> = ({ title, tools }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i}>⭐</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i}>⭐</span>);
      } else {
        stars.push(<span key={i}>☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{tool.name}</h4>
              <div className="text-sm" aria-label={`Rating: ${tool.rating} out of 5`}>
                {renderStars(tool.rating)}
              </div>
            </div>

            <div className="text-sm">
              <div className="mb-2">
                <strong className="text-green-600 dark:text-green-400">Pros:</strong>
                <ul className="list-disc list-inside mt-1 ml-2">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{pro}</li>
                  ))}
                </ul>
              </div>

              {tool.cons.length > 0 && (
                <div>
                  <strong className="text-red-600 dark:text-red-400">Cons:</strong>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolComparison;