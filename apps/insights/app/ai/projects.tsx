import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCCUsageProjects } from "./ccusage-utils";

export async function CCUsageProjects() {
  const projects = await getCCUsageProjects();

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No project activity data available
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Project usage data will appear here once available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Project Activity</h3>
        <p className="text-xs text-muted-foreground">
          Top {projects.length} projects by Claude Code usage (anonymized)
        </p>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Usage %</TableHead>
              <TableHead className="text-right">Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={project.projectName}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                      }}
                    />
                    {project.projectName}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatTokens(project.tokens)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {project.relativeUsage}%
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(project.lastActivity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Project names are anonymized for privacy. Usage percentages are relative
        to total project activity.
      </div>
    </div>
  );
}
