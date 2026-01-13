import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@duyet/components/ui/card';
import { Badge } from '@duyet/components/ui/badge';
import { cn } from '@duyet/libs/utils';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Star } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category?: string;
  status?: 'success' | 'failed' | 'pending' | 'important';
  featured?: boolean;
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  title?: string;
  description?: string;
}

export function ToolTimeline({ events, title = "时间线", description }: ToolTimelineProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'important':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex items-start space-x-4",
                "hover:bg-gray-50 transition-colors -mx-2 px-2 py-2 rounded-lg"
              )}
            >
              {/* Dot */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10",
                getStatusColor(event.status)
              )}>
                {getStatusIcon(event.status)}
              </div>

              <div className="flex-1 min-w-0">
                <Card className={cn(
                  "transition-all hover:shadow-md",
                  event.featured && "border-primary/20 shadow-sm"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      {event.category && (
                        <Badge variant="secondary">{event.category}</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{event.description}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}