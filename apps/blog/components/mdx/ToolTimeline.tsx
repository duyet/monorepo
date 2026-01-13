import React, { useState } from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  icon?: string;
  details?: string;
}

export interface ToolTimelineProps {
  items: TimelineItem[];
  title?: string;
  orientation?: 'horizontal' | 'vertical';
}

const getStatusColor = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 border-green-500';
    case 'active':
      return 'bg-blue-500 border-blue-500';
    case 'planned':
      return 'bg-gray-400 border-gray-400';
    case 'cancelled':
      return 'bg-red-500 border-red-500';
  }
};

const getStatusIcon = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'active':
      return '▶';
    case 'planned':
      return '○';
    case 'cancelled':
      return '✗';
  }
};

/**
 * ToolTimeline - Horizontal/vertical timeline with status tracking
 */
export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  items,
  title = 'Tool Timeline',
  orientation = 'vertical',
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (orientation === 'horizontal') {
    return (
      <div className="my-6 overflow-x-auto">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="flex space-x-4 pb-4" style={{ minWidth: 'max-content' }}>
          {items.map((item, index) => (
            <div key={item.id} className="flex-shrink-0 w-64">
              <div
                className={`border-l-4 pl-4 pb-4 cursor-pointer ${
                  index === 0 ? 'border-l-0' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                  <span className="text-sm text-gray-600">{item.date}</span>
                </div>
                <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  {expandedItem === item.id ? 'Show less' : 'Show details'}
                </button>
                {expandedItem === item.id && item.details && (
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {item.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute left-2 top-4 w-4 h-4 rounded-full border-2 ${getStatusColor(item.status)}`}
              ></div>

              <div
                className="ml-10 bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{item.date}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{item.description}</p>
                {expandedItem === item.id && item.details && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    {item.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};