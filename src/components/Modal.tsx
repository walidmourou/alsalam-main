"use client";

// src/components/Modal.tsx
// Accessible dialog shell for the overlays of this app. Escape and a backdrop
// click close it, the page behind it does not scroll, Tab cycles inside the
// panel, and focus returns to the trigger once it closes.
import { useEffect, useRef } from "react";
import { isTopOverlay, popOverlay, pushOverlay } from "@/lib/overlay";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Names the dialog for assistive technology. */
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  panelClassName?: string;
  /**
   * Render the built-in header (title + close button). Turn it off when the
   * content brings its own header, so title and close button appear once.
   */
  showHeader?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  panelClassName = "max-w-3xl",
  showHeader = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<symbol | null>(null);
  if (tokenRef.current === null) tokenRef.current = Symbol("modal");

  // Kept in a ref so that the effect below only depends on `isOpen`: an inline
  // `onClose` arrow would otherwise re-run it on every render and steal focus
  // from the field the user is typing in.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const token = tokenRef.current ?? Symbol("modal");
    pushOverlay(token);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isTopOverlay(token)) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        // Skip a nested dialog (the school rules modal): it owns the focus
        // while it is open.
        (element) =>
          element.offsetParent !== null &&
          element.closest('[role="dialog"]') === dialogRef.current,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      popOverlay(token);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="fixed inset-0 bg-gray-900/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`relative w-full ${panelClassName} overflow-hidden rounded-xl bg-white shadow-2xl focus:outline-none`}
        >
          {showHeader && (
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={closeLabel}
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <div
            className={
              showHeader
                ? "max-h-[75vh] overflow-y-auto bg-gray-50 px-4 py-5 sm:px-6"
                : "max-h-[85vh] overflow-y-auto"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}