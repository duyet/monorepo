import { Star, StarHalf, Check, X } from "lucide-react";
import { ReactNode } from "react";

interface ToolComparisonProps {
  tool1: string;
  tool2: string;
  pros1: string[];
  cons1: string[];
  pros2: string[];
  cons2: string[];
  rating1: number;
  rating2: number;
}

export function ToolComparison({
  tool1,
  tool2,
  pros1,
  cons1,
  pros2,
  cons2,
  rating1,
  rating2,
}: ToolComparisonProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400 inline" size={16} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400 inline" size={16} />);
    }

    return stars;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      {/* Tool 1 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
        <h3 className="text-xl font-bold mb-2">{tool1}</h3>
        <div className="flex items-center gap-2 mb-4">
          {renderStars(rating1)}
          <span className="text-sm text-gray-600 dark:text-gray-400">({rating1.toFixed(1)})</span>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 text-sm mb-1 flex items-center gap-1">
              <Check size={14} /> Pros
            </h4>
            <ul className="text-sm space-y-1">
              {pros1.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-1 flex items-center gap-1">
              <X size={14} /> Cons
            </h4>
            <ul className="text-sm space-y-1">
              {cons1.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tool 2 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
        <h3 className="text-xl font-bold mb-2">{tool2}</h3>
        <div className="flex items-center gap-2 mb-4">
          {renderStars(rating2)}
          <span className="text-sm text-gray-600 dark:text-gray-400">({rating2.toFixed(1)})</span>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 text-sm mb-1 flex items-center gap-1">
              <Check size={14} /> Pros
            </h4>
            <ul className="text-sm space-y-1">
              {pros2.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-1 flex items-center gap-1">
              <X size={14} /> Cons
            </h4>
            <ul className="text-sm space-y-1">
              {cons2.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}