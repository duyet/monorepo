import { formatDistance } from "date-fns";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { useWindowSize } from "usehooks-ts";
import { codeArtifact } from "@/artifacts/code/client";
import { sheetArtifact } from "@/artifacts/sheet/client";
import { textArtifact } from "@/artifacts/text/client";
import { useArtifact } from "@/hooks/use-artifact";
import { fetcher } from "@/lib/utils";
import { ArtifactActions } from "./artifact-actions";
import { ArtifactCloseButton } from "./artifact-close-button";

export const artifactDefinitions = [textArtifact, codeArtifact, sheetArtifact];
export type ArtifactKind = (typeof artifactDefinitions)[number]["kind"];

export type UIArtifact = {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: "streaming" | "idle";
  boundingBox: { top: number; left: number; width: number; height: number };
};

interface Document {
  id: string;
  title: string;
  content: string;
  kind: string;
  createdAt: string;
}

function PureArtifact({
  status,
  stop,
  sendMessage,
  setMessages,
}: {
  chatId: string;
  status: "streaming" | "idle" | "submitted" | "error" | "ready";
  stop: () => void;
  sendMessage: (message: any) => void;
  setMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
  isReadonly: boolean;
  selectedModelId: string;
}) {
  const { artifact, setArtifact, metadata, setMetadata } = useArtifact();

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Document[]>(
    artifact.documentId !== "init" && artifact.status !== "streaming"
      ? `/api/document?id=${artifact.documentId}`
      : null,
    fetcher
  );

  const [mode, setMode] = useState<"edit" | "diff">("edit");
  const [document, setDocument] = useState<Document | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
  const artifactContentRef = useRef<HTMLDivElement>(null);
  const userScrolledArtifact = useRef(false);
  const [isContentDirty, setIsContentDirty] = useState(false);

  useEffect(() => {
    if (artifact.status !== "streaming") {
      userScrolledArtifact.current = false;
      return;
    }
    if (userScrolledArtifact.current) return;
    const el = artifactContentRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight });
  }, [artifact.status]);

  useEffect(() => {
    if (documents && documents.length > 0) {
      const mostRecentDocument = documents.at(-1);
      if (mostRecentDocument) {
        setDocument(mostRecentDocument);
        setCurrentVersionIndex(documents.length - 1);
        if (artifact.status === "streaming" || !isContentDirty) {
          setArtifact((current) => ({
            ...current,
            content: mostRecentDocument.content ?? "",
          }));
        }
      }
    }
  }, [documents, setArtifact, artifact.status, isContentDirty]);

  useEffect(() => {
    mutateDocuments();
  }, [mutateDocuments]);

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact) return;
      mutateDocuments(
        async (currentDocs: Document[] | undefined) => {
          if (!currentDocs) return [];
          const currentDoc = currentDocs.at(-1);
          if (!currentDoc?.content) {
            setIsContentDirty(false);
            return currentDocs;
          }
          if (currentDoc.content === updatedContent) {
            setIsContentDirty(false);
            return currentDocs;
          }

          await fetch(`/api/document?id=${artifact.documentId}`, {
            method: "POST",
            body: JSON.stringify({
              title: artifact.title,
              content: updatedContent,
              kind: artifact.kind,
              isManualEdit: true,
            }),
          });

          setIsContentDirty(false);
          return currentDocs.map((doc, i) =>
            i === currentDocs.length - 1 ? { ...doc, content: updatedContent } : doc
          );
        },
        { revalidate: false }
      );
    },
    [artifact, mutateDocuments]
  );

  const latestContentRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      latestContentRef.current = updatedContent;
      setIsContentDirty(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;

      if (debounce) {
        saveTimerRef.current = setTimeout(() => {
          handleContentChange(latestContentRef.current);
          saveTimerRef.current = null;
        }, 2000);
      } else {
        handleContentChange(updatedContent);
      }
    },
    [handleContentChange]
  );

  function getDocumentContentById(index: number) {
    if (!documents) return "";
    if (!documents[index]) return "";
    return documents[index].content ?? "";
  }

  const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
    if (!documents) return;
    if (type === "latest") {
      setCurrentVersionIndex(documents.length - 1);
      setMode("edit");
    }
    if (type === "toggle") {
      setMode((m) => (m === "edit" ? "diff" : "edit"));
    }
    if (type === "prev" && currentVersionIndex > 0) {
      setCurrentVersionIndex((i) => i - 1);
    } else if (type === "next" && currentVersionIndex < documents.length - 1) {
      setCurrentVersionIndex((i) => i + 1);
    }
  };

  const isCurrentVersion =
    documents && documents.length > 0
      ? currentVersionIndex === documents.length - 1
      : true;

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const artifactDefinition = artifactDefinitions.find(
    (d) => d.kind === artifact.kind
  );

  if (!artifactDefinition) {
    throw new Error("Artifact definition not found!");
  }

  if (!artifact.isVisible && !isMobile) {
    return (
      <div className="h-dvh w-0 shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" data-testid="artifact" />
    );
  }

  if (!artifact.isVisible) return null;

  const artifactPanel = (
    <>
      <div className="flex h-[calc(3.5rem+1px)] shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-3">
          <ArtifactCloseButton />
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-semibold leading-tight tracking-tight">
              {artifact.title}
            </div>
            <div className="flex items-center gap-2">
              {isContentDirty ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                  Saving...
                </div>
              ) : document ? (
                <div className="text-xs text-muted-foreground">
                  {`Updated ${formatDistance(new Date(document.createdAt), new Date(), { addSuffix: true })}`}
                </div>
              ) : artifact.status === "streaming" ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="animate-spin">●</div>
                  Generating...
                </div>
              ) : (
                <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
              )}
              {documents && documents.length > 1 && (
                <div className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  v{currentVersionIndex + 1}/{documents.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="relative flex-1 overflow-y-auto bg-background"
        data-slot="artifact-content"
        onScroll={() => {
          const el = artifactContentRef.current;
          if (!el) return;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          userScrolledArtifact.current = !atBottom;
        }}
        ref={artifactContentRef}
      >
        <artifactDefinition.content
          content={isCurrentVersion ? artifact.content : getDocumentContentById(currentVersionIndex)}
          currentVersionIndex={currentVersionIndex}
          getDocumentContentById={getDocumentContentById}
          isCurrentVersion={isCurrentVersion}
          isInline={false}
          isLoading={isDocumentsFetching && !artifact.content}
          metadata={metadata}
          mode={mode}
          onSaveContent={saveContent}
          setMetadata={setMetadata}
          status={artifact.status}
          suggestions={[]}
          title={artifact.title}
        />
        <AnimatePresence>
          {isCurrentVersion && (
            <Toolbar
              artifactActions={
                <ArtifactActions
                  artifact={artifact}
                  currentVersionIndex={currentVersionIndex}
                  handleVersionChange={handleVersionChange}
                  isCurrentVersion={isCurrentVersion}
                  metadata={metadata}
                  mode={mode}
                  setMetadata={setMetadata}
                />
              }
              artifactKind={artifact.kind}
              documentId={artifact.documentId}
              isToolbarVisible={true}
              onClose={() => setArtifact((prev) => ({ ...prev, isVisible: false }))}
              sendMessage={sendMessage}
              setIsToolbarVisible={() => {}}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <motion.div
        animate={{ opacity: 1, x: 0, y: 0, height: windowHeight, width: "100dvw", borderRadius: 0 }}
        className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-sidebar"
        data-testid="artifact"
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 1, x: artifact.boundingBox.left, y: artifact.boundingBox.top, height: artifact.boundingBox.height, width: artifact.boundingBox.width, borderRadius: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {artifactPanel}
      </motion.div>
    );
  }

  return (
    <div
      className="flex h-dvh w-[60%] shrink-0 flex-col overflow-hidden border-l border-border/50 bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      data-testid="artifact"
    >
      {artifactPanel}
    </div>
  );
}

export const Artifact = memo(PureArtifact, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  return true;
});
