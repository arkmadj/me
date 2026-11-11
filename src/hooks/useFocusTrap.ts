import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

const getFocusable = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.getClientRects().length > 0,
  );

/**
 * Keeps keyboard focus inside `container` while mounted: Tab and Shift+Tab wrap
 * around its focusable elements, and focus that escapes (e.g. a click on the page
 * behind) is pulled back in. Focus returns to the previously focused element on
 * unmount if it is still in the document.
 */
export const useFocusTrap = (container: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (!root.contains(document.activeElement)) {
      (getFocusable(root)[0] ?? root).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusable(root);
      if (focusable.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof Node && !root.contains(e.target)) {
        (getFocusable(root)[0] ?? root).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [container]);
};
