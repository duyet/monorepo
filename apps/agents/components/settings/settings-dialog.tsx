import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load settings on open
  useEffect(() => {
    if (open) {
      const loadSettings = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/user/settings");
          if (res.ok) {
            const data = await res.json();
            setInstructions(data.customInstructions || "");
            setLanguage(data.language || "");
          }
        } catch (err) {
          console.error("Failed to load settings:", err);
        } finally {
          setIsLoading(false);
        }
      };
      loadSettings();
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customInstructions: instructions,
          language: language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          (data as { error?: string }).error ||
          `Failed to save settings (${res.status})`;
        setSaveError(message);
        return;
      }
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveError("Could not reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Customize how Duyetbot behaves and responds to you. These
            instructions will be sent with every message.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="instructions">Custom Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="E.g., Always reply in a cheerful tone. Be concise."
                value={instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInstructions(e.target.value)
                }
                className="h-24 resize-none"
              />
              <p className="text-[10px] text-muted-foreground">
                What would you like the AI to know about you to provide better
                responses?
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Input
                id="language"
                placeholder="E.g., English, Vietnamese"
                value={language}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLanguage(e.target.value)
                }
              />
            </div>
          </div>
        )}

        {saveError && (
          <p className="text-sm text-destructive px-1">{saveError}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
