import { Clock } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

interface ToolTimelineProps {
  items: TimelineItem[];
  orientation?: 'horizontal' | 'vertical';
}

const variantStyles = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ToolTimeline({ items, orientation = 'vertical' }: ToolTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="my-6 overflow-x-auto">
        <div className="flex min-w-max items-start gap-4 pb-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[180px]">
              <div className="flex items-center justify-center w-full">
                <div className={`h-3 w-3 rounded-full ${variantStyles[item.variant || 'default']}`} />
                {idx < items.length - 1 && (
                  <div className={`flex-1 h-1 ${variantStyles[item.variant || 'default']}/20 bg-opacity-50`} />
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="inline mr-1" />
                  {item.date}
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical timeline
  return (
    <div className="my-6">
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="relative pl-6">
            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${variantStyles[item.variant || 'default']}`} />
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {item.date}
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-base mt-1">
                {item.title}
              </div>
              {item.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}