"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export type InfoBoxType = "info" | "warning" | "success" | "error";

export interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * InfoBox - Callout box with icon and content
 * Claude-style minimal design with colored left border
 */
export function InfoBox({
  type = "info",
  title,
  children,
  className = "",
}: InfoBoxProps) {
  const iconMap: Record<InfoBoxType, React.ReactNode> = {
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
  };

  const borderColorMap: Record<InfoBoxType, string> = {
    info: "border-l-blue-500",
    warning: "border-l-yellow-500",
    success: "border-l-green-500",
    error: "border-l-red-500",
  };

  const textColorMap: Record<InfoBoxType, string> = {
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={`border-l-2 ${borderColorMap[type]} pl-4 py-3 space-y-2 ${className}`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${textColorMap[type]}`}>
          {iconMap[type]}
        </div>
        <div className="flex-1 space-y-1">
          {title && (
            <h3 className="font-medium text-gray-900 dark:text-white text-base">
              {title}
            </h3>
          )}
          <div className="text-gray-700 dark:text-gray-300 text-base">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoBox;
