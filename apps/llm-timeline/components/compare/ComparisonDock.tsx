import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComparisonModal } from "./ComparisonModal";
import type { Model } from "@/lib/data";

interface ComparisonDockProps {
  selectedModels: Model[];
  canCompare: boolean;
  isModalOpen: boolean;
  onRemove: (modelName: string) => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

/**
 * The bottom selection bar plus the comparison modal it opens. Only mounted on
 * routes that allow comparison (no year/org pre-filter).
 */
export function ComparisonDock({
  selectedModels,
  canCompare,
  isModalOpen,
  onRemove,
  onOpenModal,
  onCloseModal,
}: ComparisonDockProps) {
  return (
    <>
      {selectedModels.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--rd-border)] bg-background p-3 animate-in slide-in-from-bottom">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-wrap gap-1.5">
                {selectedModels.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--rd-border)] bg-card px-2.5 py-1.5 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {model.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 text-muted-foreground [&_svg]:size-3"
                      onClick={() => onRemove(model.name)}
                      aria-label={`Remove ${model.name} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={onOpenModal}
                disabled={!canCompare}
                size="sm"
                className="shrink-0"
              >
                Compare ({selectedModels.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && canCompare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
          onClick={onCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <ComparisonModal
              models={selectedModels}
              onClose={onCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
}
