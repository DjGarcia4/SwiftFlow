// Whether the user asked the OS to minimize animations. Anything animated
// from JS (count-ups, the theme reveal) checks this; CSS animations are
// already handled globally in style.css.
export const prefersReducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

// Inline style for the nth item of a staggered entrance, capped so long
// lists don't keep the last items waiting.
export const staggerStyle = (index, { step = 60, base = 0, max = 600 } = {}) => ({
  animationDelay: `${Math.min(base + index * step, max)}ms`,
});
