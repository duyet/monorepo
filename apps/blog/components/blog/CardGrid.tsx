"use client";

import {
  Activity,
  AlertTriangle,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Cloud,
  Code,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  Globe,
  HardDrive,
  Heart,
  Info,
  Key,
  Link,
  Lock,
  Mail,
  MapPin,
  Network,
  Search,
  Server,
  Settings,
  Shield,
  Star,
  Terminal,
  TrendingUp,
  User,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import type React from "react";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  Circle,
  Database,
  Server,
  Cloud,
  Code,
  FileText,
  Globe,
  Zap,
  Heart,
  Star,
  BookOpen,
  Terminal,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Lock,
  Key,
  Settings,
  Wrench,
  GitBranch,
  BarChart2,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Eye,
  ExternalLink,
  Link,
  Mail,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
};

export interface Card {
  id: string;
  icon?: string;
  title: string;
  description: string;
  link?: {
    text: string;
    href: string;
  };
}

export interface CardGridProps {
  cards: Card[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * CardGrid - 3-column card grid with icons
 * Claude-style minimal design with subtle borders
 */
export function CardGrid({
  cards,
  columns = 3,
  className = "",
}: CardGridProps) {
  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return Circle;
    return ICON_MAP[iconName] ?? Circle;
  };

  if (!cards || cards.length === 0) {
    return (
      <div
        className={`text-base text-gray-500 dark:text-gray-400 ${className}`}
      >
        No cards available
      </div>
    );
  }

  const colsMap = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colsMap[columns]} gap-4 ${className}`}>
      {cards.map((card) => {
        const IconComponent = getIconComponent(card.icon);

        return (
          <div
            key={card.id}
            className="border border-gray-200 dark:border-slate-800 p-4 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-gray-400 dark:text-gray-600">
                  <IconComponent size={24} />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-base">
                  {card.title}
                </h3>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {card.description}
              </p>

              {card.link && (
                <a
                  href={card.link.href}
                  className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {card.link.text} →
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CardGrid;
