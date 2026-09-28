// Brings an element to the top of the box that scrolls it -- only that box.
// scrollIntoView also scrolls every ancestor that can, and the page itself
// can (a few positioned bits reach past the app's own box), so it would
// slide the whole app up under the nav and leave the top cut off.

// The nearest ancestor that scrolls vertically
export const scrollerOf = (element) => {
  let node = element?.parentElement;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
};

// `offset`: room left above it, in pixels (a sticky strip, a bit of air)
export const scrollToElement = (element, { offset = 0, smooth = true } = {}) => {
  const scroller = scrollerOf(element);
  if (!element || !scroller) return;
  const top =
    scroller.scrollTop +
    element.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top -
    offset;
  scroller.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
};
