import React from "react";

interface ToolTimelineProps {
  orientation?: "horizontal" | "vertical";
  items: Array<{
    title: string;
    date: string;
    description: string;
    status: "active" | "completed" | "planned" | "deprecated";
  }>;
}

export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  orientation = "horizontal",
  items
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "planned": return "bg-yellow-500";
      case "deprecated": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "completed": return "Completed";
      case "planned": return "Planned";
      case "deprecated": return "Deprecated";
      default: return "Unknown";
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className="w-full mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Tool Timeline</h3>
        <div className="flex overflow-x-auto pb-4">
          {items.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-64 p-4">
              <div className="relative">
                <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${getStatusColor(item.status)}`}></div>
                {index < items.length - 1 && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gray-300 -ml-32"></div>
                )}
                <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.date}</p>
                  <p className="text-sm mb-3">{item.description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Tool Timeline</h3>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)}`}></div>
              {index < items.length - 1 && (
                <div className="flex-1 w-0.5 bg-gray-300 my-1"></div>
              )}
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.date}</p>
              <p className="text-sm mb-3">{item.description}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};