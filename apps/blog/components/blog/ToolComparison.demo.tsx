/**
 * ToolComparison Component Demo
 *
 * This file demonstrates how to use the ToolComparison component
 * with various configurations and use cases.
 */

import { ToolComparison } from "./ToolComparison";
import type { ToolComparisonProps } from "./types";

// Example 1: Basic Tool Comparison
export function BasicToolComparisonDemo() {
  const toolData: ToolComparisonProps = {
    name: "React",
    rating: 5,
    pros: [
      "Large ecosystem and community support",
      "Excellent documentation and learning resources",
      "Virtual DOM for performance optimization",
      "JSX makes code more readable",
    ],
    cons: [
      "Steeper learning curve for beginners",
      "Frequent updates can require migration effort",
      "Requires additional libraries for routing and state management",
    ],
  };

  return <ToolComparison {...toolData} />;
}

// Example 2: Tool with Winner Badge
export function WinnerToolComparisonDemo() {
  const toolData: ToolComparisonProps = {
    name: "TypeScript",
    rating: 5,
    winner: true,
    pros: [
      "Strong type safety prevents runtime errors",
      "Excellent IDE support and autocomplete",
      "Self-documenting code through types",
      "Scales well for large codebases",
    ],
    cons: [
      "Additional compilation step required",
      "Learning curve for JavaScript developers",
      "Type definitions can be verbose",
    ],
    description:
      "TypeScript has become the standard for building scalable JavaScript applications. The type system catches bugs at compile time, and the developer experience is significantly enhanced with intelligent tooling support.",
  };

  return <ToolComparison {...toolData} />;
}

// Example 3: Comparison of Multiple Tools
export function MultipleToolComparisonDemo() {
  const tools: ToolComparisonProps[] = [
    {
      name: "Next.js",
      rating: 5,
      winner: true,
      pros: [
        "Full-stack framework with built-in SSR and static generation",
        "File-based routing system",
        "Integrated API routes",
        "Excellent performance out of the box",
        "Seamless deployment to Vercel",
      ],
      cons: [
        "Can be overkill for simple projects",
        "Vendor lock-in with Vercel optimizations",
        "Learning curve for advanced features",
      ],
      description:
        "Next.js provides an opinionated, production-ready framework for React applications. It handles optimization and scaling concerns automatically, allowing developers to focus on building features.",
    },
    {
      name: "Remix",
      rating: 4,
      pros: [
        "Progressive enhancement and graceful degradation",
        "Form-first approach aligns with web standards",
        "Excellent error boundaries and error handling",
        "Great for accessibility",
      ],
      cons: [
        "Smaller ecosystem compared to Next.js",
        "Less mature than Next.js",
        "Requires more manual configuration",
      ],
      description:
        "Remix emphasizes web fundamentals and progressive enhancement. It excels at handling complex forms and provides superior error handling out of the box.",
    },
    {
      name: "Astro",
      rating: 4,
      pros: [
        "Zero JavaScript by default",
        "Excellent performance for content-heavy sites",
        "Supports multiple UI frameworks",
        "Island-based architecture",
      ],
      cons: [
        "Best suited for content-focused sites",
        "Less suitable for highly interactive applications",
        "Smaller ecosystem",
      ],
      description:
        "Astro is optimized for content-rich websites and static sites. Its island-based approach loads minimal JavaScript, making it exceptionally fast.",
    },
  ];

  return (
    <div className="space-y-6">
      {tools.map((tool) => (
        <ToolComparison key={tool.name} {...tool} />
      ))}
    </div>
  );
}

// Example 4: Tool with Various Ratings
export function RatingVariationsDemo() {
  const ratings = [1, 2, 3, 4, 5] as const;

  return (
    <div className="space-y-6">
      {ratings.map((rating) => (
        <ToolComparison
          key={rating}
          name={`Example Tool (${rating} Stars)`}
          rating={rating}
          pros={[
            `First advantage of ${rating}-star tool`,
            `Second advantage of ${rating}-star tool`,
          ]}
          cons={[
            `First disadvantage of ${rating}-star tool`,
            `Second disadvantage of ${rating}-star tool`,
          ]}
        />
      ))}
    </div>
  );
}

// Example 5: Error Handling - Invalid Props
export function ErrorHandlingDemo() {
  return (
    <div className="space-y-6">
      {/* Missing required props */}
      <ToolComparison
        // @ts-expect-error - Missing required props for demo
        name={null}
        rating={5}
        pros={["Pro 1"]}
        cons={["Con 1"]}
      />

      {/* Invalid pros type */}
      <ToolComparison
        name="Test"
        rating={5}
        // @ts-expect-error - Invalid type for demo
        pros="Invalid type"
        cons={["Con 1"]}
      />
    </div>
  );
}

// Example 6: Responsive Layout Demo
export function ResponsiveLayoutDemo() {
  const toolData: ToolComparisonProps = {
    name: "Next.js",
    rating: 5,
    pros: [
      "Full-stack framework with built-in SSR and static generation",
      "File-based routing system",
      "Integrated API routes",
      "Excellent performance out of the box",
    ],
    cons: [
      "Can be overkill for simple projects",
      "Vendor lock-in with Vercel optimizations",
      "Learning curve for advanced features",
    ],
    description:
      "Next.js provides a modern, production-ready framework for React applications. This demo shows how the component adapts to different screen sizes.",
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">
          Desktop View (greater than 640px)
        </h3>
        <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
          <ToolComparison {...toolData} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">
          Mobile View (less than 640px)
        </h3>
        <div className="rounded-lg border border-gray-200 p-2">
          <div style={{ width: "320px" }}>
            <ToolComparison {...toolData} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 7: Dark Mode Demo
export function DarkModeDemo() {
  const toolData: ToolComparisonProps = {
    name: "Tailwind CSS",
    rating: 5,
    winner: true,
    pros: [
      "Utility-first approach for rapid development",
      "Highly customizable configuration",
      "Great community and ecosystem",
      "Excellent dark mode support",
    ],
    cons: [
      "HTML can become cluttered with class names",
      "Requires build step optimization",
      "CSS file size can be large without proper configuration",
    ],
    description:
      "Tailwind CSS has revolutionized how developers approach styling. The utility-first approach, combined with great dark mode support, makes it an excellent choice for modern web applications.",
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Light Mode</h3>
        <ToolComparison {...toolData} />
      </div>

      <div className="rounded-lg bg-gray-950 p-6 dark">
        <h3 className="mb-4 text-lg font-bold text-white">Dark Mode</h3>
        <ToolComparison {...toolData} />
      </div>
    </div>
  );
}
