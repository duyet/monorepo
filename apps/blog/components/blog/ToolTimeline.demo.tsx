/**
 * ToolTimeline Component Demo
 *
 * This file demonstrates how to use the ToolTimeline component
 * with various events and statuses.
 */

import type { TimelineEvent } from "./types";
import { ToolTimeline } from "./ToolTimeline";

// Example events for the timeline
const DEMO_EVENTS: TimelineEvent[] = [
  {
    id: "1",
    name: "React",
    date: "2020-01-15",
    status: "active",
    details:
      "Started using React for building interactive user interfaces. React provides excellent component reusability and a strong ecosystem.",
    reason: "Team decision to standardize on React for all web projects",
  },
  {
    id: "2",
    name: "TypeScript",
    date: "2020-06-01",
    status: "adopted",
    details:
      "Migrated the entire codebase to TypeScript to improve code quality, type safety, and developer experience.",
    reason: "Caught critical bugs early and improved IDE support",
  },
  {
    id: "3",
    name: "Next.js",
    date: "2021-03-20",
    status: "active",
    details:
      "Adopted Next.js for SSR capabilities and built-in optimization. Improved SEO and performance significantly.",
    reason: "Needed server-side rendering for better SEO performance",
  },
  {
    id: "4",
    name: "GraphQL",
    date: "2021-09-10",
    status: "testing",
    details:
      "Experimental adoption of GraphQL for specific APIs. Testing shows promise but evaluating against REST alternatives.",
    reason: "Exploring better API query flexibility",
  },
  {
    id: "5",
    name: "Webpack",
    date: "2022-02-14",
    status: "deprecated",
    details:
      "Transitioned away from Webpack to Vite for faster development builds and better developer experience.",
    reason:
      "Vite provides faster hot module replacement and better build performance",
  },
  {
    id: "6",
    name: "Tailwind CSS",
    date: "2022-05-08",
    status: "active",
    details:
      "Adopted Tailwind CSS for utility-first styling. Significantly reduced CSS bundle size and improved consistency.",
    reason: "Improved development velocity with utility classes",
  },
  {
    id: "7",
    name: "Framer Motion",
    date: "2022-08-22",
    status: "active",
    details:
      "Integrated Framer Motion for advanced animations. Provides intuitive API for complex motion graphics.",
    reason: "Enhanced user experience with smooth animations",
  },
  {
    id: "8",
    name: "Vercel KV",
    date: "2023-01-30",
    status: "adopted",
    details:
      "Adopted Vercel KV for Redis-backed caching and session management. Simplified deployment and reduced infrastructure costs.",
    reason: "Unified deployment platform with excellent DX",
  },
];

export function ToolTimelineDemo() {
  const handleEventExpand = (event: TimelineEvent) => {
    console.log("Event expanded:", event.id, event.name);
  };

  const handleEventCollapse = (event: TimelineEvent) => {
    console.log("Event collapsed:", event.id, event.name);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Tool Timeline
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A chronological view of technology adoption, with keyboard navigation
          and responsive design.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Technology Journey
        </h2>

        <ToolTimeline
          events={DEMO_EVENTS}
          onEventExpand={handleEventExpand}
          onEventCollapse={handleEventCollapse}
          className="mt-8"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Features
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li>✓ Horizontal scrollable timeline on desktop (width ≥ 640px)</li>
          <li>✓ Vertical stacked timeline on mobile (&lt; 640px)</li>
          <li>
            ✓ Color-coded status dots: green (active), amber (adopted), blue
            (testing), gray (deprecated)
          </li>
          <li>
            ✓ Full keyboard navigation: Arrow keys, Enter/Space to expand,
            Escape to close
          </li>
          <li>✓ Smooth expand/collapse animations with Framer Motion</li>
          <li>✓ Dark mode support</li>
          <li>✓ WCAG 2.1 AA compliant with proper ARIA labels</li>
          <li>✓ Hover and focus states for accessibility</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Usage
        </h3>
        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
          {`<ToolTimeline
  events={events}
  onEventExpand={(event) => console.log('Expanded:', event.name)}
  onEventCollapse={(event) => console.log('Collapsed:', event.name)}
  className="my-8"
/>`}
        </pre>
      </div>
    </div>
  );
}
