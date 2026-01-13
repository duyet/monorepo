import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@duyet/components/ui/card';
import { cn } from '@duyet/libs/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface WorkflowStep {
  label: string;
  description: string;
  icon: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  animated?: boolean;
}

export function WorkflowDiagram({ steps, title = "Workflow", animated = true }: WorkflowDiagramProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Connecting lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 to-primary/20" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <motion.div
                  initial={animated ? { scale: 0.8, opacity: 0 } : false}
                  animate={animated ? { scale: 1, opacity: 1 } : false}
                  transition={animated ? { delay: index * 0.2, type: "spring" } : {}}
                  className={cn(
                    "w-24 h-24 rounded-xl border-2 border-primary/30 bg-primary/5 flex items-center justify-center",
                    "shadow-sm hover:shadow-md transition-all"
                  )}
                >
                  <span className="text-3xl">{step.icon}</span>
                </motion.div>

                <motion.div
                  initial={animated ? { y: 20, opacity: 0 } : false}
                  animate={animated ? { y: 0, opacity: 1 } : false}
                  transition={animated ? { delay: index * 0.2 + 0.1 } : {}}
                  className="mt-3 text-center space-y-1 px-2"
                >
                  <div className="font-semibold text-sm">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    animate={animated ? { x: [0, 5, 0] } : false}
                    transition={animated ? { repeat: Infinity, duration: 2, delay: index * 0.2 } : {}}
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2"
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

