import { type JSX, type ReactNode, useEffect, useId, useRef } from "react";

interface BurnsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name. Also rendered visually hidden as the dialog heading. */
  title: string;
  /** Header content left of the close control, e.g. tabs. */
  tabs: ReactNode;
  children: ReactNode;
}

/**
 * Modal shell for the breakdown.
 *
 * `showModal()` already traps focus, closes on Escape and restores focus to
 * the trigger; this adds the pieces it does not: an accessible name, a header
 * with a visible close control for touch and screen-reader users, and a click
 * on the backdrop to close. Open/close motion lives in the stylesheet.
 */
export function BurnsDialog({
  open,
  onClose,
  title,
  tabs,
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
      <div className="burns-dlg">
        <h2 id={titleId} className="burns-sr-only">
          {title}
        </h2>
        <div className="burns-dlg-head">
          {tabs}
          <button
            type="button"
            className="burns-text-btn"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
