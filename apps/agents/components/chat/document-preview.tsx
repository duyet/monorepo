import { memo } from "react";
import { codeArtifact } from "@/artifacts/code/client";
import { sheetArtifact } from "@/artifacts/sheet/client";
import { textArtifact } from "@/artifacts/text/client";
import type { UIArtifact } from "./artifact";

const _artifactDefinitions = [textArtifact, codeArtifact, sheetArtifact];

type DocumentPreviewProps = {
  status: UIArtifact["status"];
  documentId: string;
};

function PureDocumentPreview({
  status,
  documentId,
}: DocumentPreviewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-sm font-medium text-muted-foreground">
        {documentId !== "init" ? `Document ${documentId}` : "No document"}
      </div>
      <div className="text-xs text-muted-foreground">
        {status === "streaming" ? "Generating..." : "Ready"}
      </div>
    </div>
  );
}

export const DocumentPreview = memo(PureDocumentPreview);
