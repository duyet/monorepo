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
        className={`text-base text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 ${className}`}
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
            className="border border-[#1a1a1a]/10 dark:border-white/10 p-4 hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                  <IconComponent size={24} />
                </div>
                <h3 className="font-medium text-[#1a1a1a] dark:text-[#f8f8f2] text-base">
                  {card.title}
                </h3>
              </div>

              <p className="text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 text-sm leading-relaxed">
                {card.description}
              </p>

              {card.link && (
                <a
                  href={card.link.href}
                  className="inline-block text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55 hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2] transition-colors"
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
