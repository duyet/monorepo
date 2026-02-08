"use client";

import { Download, FileText, LinkIcon, Mail, Printer, Share2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@duyet/components/ui/button";

export function CvActions() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/cv/pdf", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "duyet-le-resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Fallback to print dialog
      window.print();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareOptions(false);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent("Duyet Le - Resume");
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share my resume with you.\n\nYou can view it online at: ${window.location.href}\n\nBest regards,\nDuyet`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareOptions(false);
  };

  const togglePrintPreview = () => {
    setIsPreviewMode(!isPreviewMode);
    document.body.classList.toggle("print-preview", !isPreviewMode);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={togglePrintPreview}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {isPreviewMode ? "Exit Preview" : "Preview"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {showShareOptions && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowShareOptions(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-md border bg-popover p-1 shadow-md">
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </button>
                <button
                  onClick={handleShareViaEmail}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isPreviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePrintPreview}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Close Preview
              </Button>
            </div>
            <div className="origin-scale-100 scale-95 print:scale-100">
              <div id="print-preview-content" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
