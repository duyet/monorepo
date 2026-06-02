import type { Model } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getLicenseBadgeVariant } from "@/lib/utils";

interface ComparisonTableProps {
  sortedModels: Model[];
}

export function ComparisonTable({ sortedModels }: ComparisonTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[var(--rd-surface-2)]">
          <TableHead className="w-32 text-xs uppercase tracking-wider text-muted-foreground">
            Metric
          </TableHead>
          {sortedModels.map((model) => (
            <TableHead key={model.name}>{model.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Organization
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell key={model.name}>{model.org}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Release Date
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell
              key={model.name}
              className="font-[family-name:var(--font-mono)] text-sm"
            >
              {formatDate(model.date)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Parameters
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell
              key={model.name}
              className="font-[family-name:var(--font-mono)] text-sm"
            >
              {model.params || "Unknown"}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            License
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell key={model.name}>
              <Badge variant={getLicenseBadgeVariant(model.license)}>
                {model.license}
              </Badge>
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Type
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell key={model.name} className="capitalize">
              {model.type}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="border-b-0">
          <TableCell className="align-top text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </TableCell>
          {sortedModels.map((model) => (
            <TableCell key={model.name} className="text-sm">
              {model.desc}
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}
