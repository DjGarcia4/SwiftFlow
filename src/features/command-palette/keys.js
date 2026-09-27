// The keys the palette opens with, written the way this computer says them
export const isApple = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");

export const paletteKeys = () => (isApple() ? "⌘K" : "Ctrl K");

// Ctrl+K, or ⌘+K on a Mac -- either works on both, for keyboards and
// habits brought from elsewhere
export const isPaletteShortcut = (event) =>
  (event.metaKey || event.ctrlKey) &&
  !event.altKey &&
  !event.shiftKey &&
  event.key?.toLowerCase() === "k";

// Where a typed "?" is text, not a request for the shortcuts
export const isEditable = (element) =>
  Boolean(
    element?.closest?.("input, textarea, select, [contenteditable='true']") ||
    element?.isContentEditable
  );
