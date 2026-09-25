import { watch, nextTick, onUnmounted, unref } from "vue";

// What a dialog does with the keyboard: while it's open, focus moves into
// it, Tab and Shift+Tab go round inside it instead of wandering to the page
// behind, and Escape closes it; once closed, focus goes back to whatever
// opened it.
//
// `open`: a ref, or a getter, true while the dialog shows.
// `container`: a ref to the dialog's element.
// `onClose`: called on Escape.
// `initialFocus`: optional ref to what gets focus first; otherwise the
// first thing that can take it.

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const focusableIn = (element) =>
  element
    ? [...element.querySelectorAll(FOCUSABLE)].filter(
        (el) => !el.closest("[inert], [aria-hidden='true']") && el.getClientRects().length
      )
    : [];

export const useModalFocus = ({ open, container, onClose, initialFocus = null }) => {
  let returnTo = null;

  const onKeydown = (event) => {
    const element = unref(container);
    if (!element) return;

    if (event.key === "Escape" && onClose) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const items = focusableIn(element);
    if (!items.length) {
      event.preventDefault();
      element.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const inside = element.contains(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  };

  const activate = async () => {
    returnTo = document.activeElement;
    // Capture, so the page's own shortcuts (space to restart, typing
    // anywhere) never see keys meant for the dialog
    document.addEventListener("keydown", onKeydown, true);
    await nextTick();
    // Transitions mount the content a frame later
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const element = unref(container);
    if (!element) return;
    const target = unref(initialFocus) ?? focusableIn(element)[0] ?? element;
    if (target === element && !element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });
  };

  const deactivate = () => {
    document.removeEventListener("keydown", onKeydown, true);
    const target = returnTo;
    returnTo = null;
    if (target?.isConnected && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  };

  watch(
    () => Boolean(typeof open === "function" ? open() : unref(open)),
    (isOpen, wasOpen) => {
      if (isOpen && !wasOpen) activate();
      if (!isOpen && wasOpen) deactivate();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (returnTo !== null) deactivate();
    document.removeEventListener("keydown", onKeydown, true);
  });
};
