/**
 * WakaTimeChart Component Demo
 *
 * This file demonstrates how to use the WakaTimeChart component
 * with various configurations and use cases.
 */

import { WakaTimeChart } from "./WakaTimeChart";
import type { WakaTimeChartProps, WakaTimeDataPoint } from "./types";

// Generate mock data for demonstrations
function generateMockData(days = 30): WakaTimeDataPoint[] {
  const data: WakaTimeDataPoint[] = [];
  const languages = ["TypeScript", "JavaScript", "Python", "Rust", "Go"];

  for (let i = days; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const point: WakaTimeDataPoint = {
      date: dateStr,
    };

    languages.forEach((lang) => {
      // Generate random hours (0-8) with some variation
      const baseHours = Math.random() * 8;
      const randomVariation = (Math.random() - 0.5) * 2;
      point[lang] = Math.max(
        0,
        Math.round((baseHours + randomVariation) * 10) / 10
      );
    });

    data.push(point);
  }

  return data;
}

// Example 1: Basic WakaTime Chart with 30 days of data
export function BasicWakaTimeChartDemo() {
  const data = generateMockData(30);

  return <WakaTimeChart data={data} title="Monthly Coding Activity" />;
}

// Example 2: WakaTime Chart with extended data (90 days)
export function ExtendedWakaTimeChartDemo() {
  const data = generateMockData(90);

  return <WakaTimeChart data={data} title="Quarterly Coding Activity" />;
}

// Example 3: WakaTime Chart with minimal data
export function MinimalWakaTimeChartDemo() {
  const data: WakaTimeDataPoint[] = [
    { date: "2024-01-01", TypeScript: 5, JavaScript: 2 },
    { date: "2024-01-02", TypeScript: 6, JavaScript: 3 },
    { date: "2024-01-03", TypeScript: 4, JavaScript: 4 },
    { date: "2024-01-04", TypeScript: 7, JavaScript: 2 },
    { date: "2024-01-05", TypeScript: 5, JavaScript: 3 },
  ];

  return <WakaTimeChart data={data} title="Weekly Activity" />;
}

// Example 4: Empty data state
export function EmptyWakaTimeChartDemo() {
  return <WakaTimeChart data={[]} title="No Data Available" />;
}

// Example 5: Single language tracking
export function SingleLanguageDemo() {
  const data: WakaTimeDataPoint[] = [];
  for (let i = 14; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    data.push({
      date: dateStr,
      TypeScript: Math.round(Math.random() * 8 * 10) / 10,
    });
  }

  return <WakaTimeChart data={data} title="TypeScript Activity" />;
}

// Example 6: Many languages
export function ManyLanguagesDemo() {
  const languages = [
    "TypeScript",
    "JavaScript",
    "Python",
    "Rust",
    "Go",
    "Other",
  ];
  const data: WakaTimeDataPoint[] = [];

  for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const point: WakaTimeDataPoint = {
      date: dateStr,
    };

    languages.forEach((lang) => {
      point[lang] = Math.round(Math.random() * 6 * 10) / 10;
    });

    data.push(point);
  }

  return <WakaTimeChart data={data} title="All Languages" />;
}

// Example 7: Custom title and responsive layout
export function CustomTitleDemo() {
  const data = generateMockData(45);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">Chart with Custom Title</h3>
        <WakaTimeChart data={data} title="My Development Activity - Q1 2024" />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Chart without Title</h3>
        <WakaTimeChart data={data} />
      </div>
    </div>
  );
}

// Example 8: Dark mode demo
export function DarkModeDemo() {
  const data = generateMockData(30);

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Light Mode</h3>
        <WakaTimeChart data={data} title="Coding Activity" />
      </div>

      <div className="rounded-lg bg-gray-950 p-6 dark">
        <h3 className="mb-4 text-lg font-bold text-white">Dark Mode</h3>
        <WakaTimeChart data={data} title="Coding Activity" />
      </div>
    </div>
  );
}

// Example 9: Responsive layout showcase
export function ResponsiveLayoutDemo() {
  const data = generateMockData(30);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">
          Desktop View (larger than 768px)
        </h3>
        <div className="rounded-lg border border-gray-200 p-4 md:p-6">
          <WakaTimeChart data={data} title="Desktop Layout" />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">
          Mobile View (smaller than 768px)
        </h3>
        <div className="rounded-lg border border-gray-200 p-2">
          <div style={{ width: "360px" }}>
            <WakaTimeChart data={data} title="Mobile Layout" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 10: Uneven distribution of languages
export function UnevenDistributionDemo() {
  const data: WakaTimeDataPoint[] = [];

  for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    data.push({
      date: dateStr,
      TypeScript: Math.round(Math.random() * 6 * 10) / 10, // Most common
      JavaScript: Math.round(Math.random() * 3 * 10) / 10,
      Python: Math.round(Math.random() * 2 * 10) / 10, // Least common
    });
  }

  return <WakaTimeChart data={data} title="Language Distribution Over Time" />;
}
