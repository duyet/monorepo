import { type JSX, type ReactNode, useEffect, useId, useRef } from "react";

interface BurnsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name. Also rendered visually hidden as the dialog heading. */
  title: string;
  children: ReactNode;
}

/**
 * Modal shared by the all-time and period breakdowns.
 *
 * `showModal()` already traps focus, closes on Escape and restores focus to
 * the trigger; this adds the pieces it does not: an accessible name and a
 * visible close control for touch and screen-reader users.
 */
export function BurnsDialog({
  open,
  onClose,
  title,
  children,
}: BurnsDialogProps): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="burns-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <h2 id={titleId} className="burns-sr-only">
        {title}
      </h2>
      <button
        type="button"
        className="burns-dialog-close"
        aria-label="Close"
        onClick={onClose}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>
      <div className="burns-dialog-body">{children}</div>
    </dialog>
  );
}
