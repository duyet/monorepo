'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface WorkflowStep {
  label: string;
  icon?: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  variant?: 'circular' | 'linear';
}

export function WorkflowDiagram({ steps, variant = 'circular' }: WorkflowDiagramProps) {
  if (variant === 'linear') {
    return (
      <div className="my-6">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 md:gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                  {step.icon || idx + 1}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-[80px]">
                  {step.label}
                </span>
              </motion.div>
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 24 }}
                  transition={{ duration: 0.3 }}
                  className="h-1 bg-blue-500 rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Circular variant
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <div className="my-6 flex justify-center">
      <svg width={300} height={300} viewBox="0 0 300 300">
        {/* Circular path */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          className="opacity-50"
        />

        {/* Animated arrows */}
        {steps.map((_, idx) => {
          const angle = (idx / steps.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const nextAngle = ((idx + 1) / steps.length) * 2 * Math.PI - Math.PI / 2;
          const nextX = centerX + radius * Math.cos(nextAngle);
          const nextY = centerY + radius * Math.sin(nextAngle);

          return (
            <motion.g
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
            >
              <motion.line
                x1={x}
                y1={y}
                x2={nextX}
                y2={nextY}
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              />
              <motion.polygon
                points={`${nextX},${nextY} ${nextX - 6},${nextY - 4} ${nextX - 6},${nextY + 4}`}
                fill="#3b82f6"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: idx * 0.2 }}
              />
            </motion.g>
          );
        })}

        {/* Step nodes */}
        {steps.map((step, idx) => {
          const angle = (idx / steps.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <motion.g
              key={idx}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: idx * 0.15 }}
            >
              <circle cx={x} cy={y} r={20} fill="#3b82f6" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {step.icon || idx + 1}
              </text>
              <text
                x={x}
                y={y + 30}
                textAnchor="middle"
                className="text-[10px] fill-gray-700 dark:fill-gray-300"
              >
                {step.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}