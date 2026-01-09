import { VersionDiff } from "@/components/blog";
import type { Version } from "@/components/blog";

/**
 * Example usage of the VersionDiff component
 * This demonstrates all features including:
 * - Multiple versions with different diffs
 * - Upcoming versions (future dates)
 * - Git-style commit messages
 * - Mobile-responsive slider
 * - Dark mode support
 */

const exampleVersions: Version[] = [
  {
    id: "v1.0.0",
    label: "v1.0.0",
    message: "Initial release with basic functionality",
    date: new Date("2024-01-15"),
    diff: `+ Added initial project structure
+ Implemented core authentication
+ Created database schema
+ Added basic UI components`,
  },
  {
    id: "v1.1.0",
    label: "v1.1.0",
    message: "Performance improvements and bug fixes",
    date: new Date("2024-02-20"),
    diff: `+ Added caching layer for API responses
+ Optimized database queries
- Removed deprecated auth method
- Fixed memory leak in event listener
+ Implemented request batching
+ Added response compression`,
  },
  {
    id: "v1.2.0",
    label: "v1.2.0",
    message: "Enhanced UI and new features",
    date: new Date("2024-03-10"),
    diff: `+ Added dark mode support
+ Implemented new dashboard layout
+ Added export to PDF functionality
- Removed old report generator
+ Improved mobile responsiveness
+ Added real-time notifications
+ Enhanced error handling`,
  },
  {
    id: "v2.0.0",
    label: "v2.0.0",
    message: "Major overhaul with new architecture",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    diff: `+ Migrated to new API structure
+ Implemented microservices architecture
+ Added GraphQL support
- Removed REST endpoints (deprecated)
+ Enhanced security with JWT
+ Added rate limiting
+ Improved monitoring and logging`,
  },
];

export function VersionDiffExample() {
  const handleVersionChange = (version: Version, index: number) => {
    console.log(`Switched to version ${index}: ${version.label}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
        <VersionDiff
          versions={exampleVersions}
          onVersionChange={handleVersionChange}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Without Metadata</h2>
        <VersionDiff
          versions={exampleVersions}
          showMetadata={false}
          diffHeight="400px"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Custom Height</h2>
        <VersionDiff versions={exampleVersions} diffHeight="300px" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Single Version</h2>
        <VersionDiff versions={[exampleVersions[0]]} showMetadata={true} />
      </div>
    </div>
  );
}
