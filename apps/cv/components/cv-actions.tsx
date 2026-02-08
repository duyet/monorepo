"use client";

import { Download, LinkIcon, Mail, Printer, Share2 } from "lucide-react";
import { useState } from "react";

export function CvActions() {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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

  return (
    <>
      {/* Print Preview Modal */}
      <div id="print-preview" className="hidden print:block" />

      {/* Clean Footer Actions - Only visible on screen, hidden on print */}
      <footer className="mt-16 border-t print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Main Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handlePrint}
                className="group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>

              <button
                onClick={handleDownloadPDF}
                className="group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {showShareOptions && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowShareOptions(false)}
                    />
                    <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 min-w-[200px] rounded-xl border bg-white p-2 shadow-lg dark:bg-gray-900 dark:border-gray-800">
                      <button
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                      </button>
                      <button
                        onClick={handleShareViaEmail}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>Email</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Small copyright note */}
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Duyet Le. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Print Preview Styles */}
      <style jsx>{`
        @media print {
          footer {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
