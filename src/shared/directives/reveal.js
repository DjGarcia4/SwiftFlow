import { prefersReducedMotion } from "@/shared/utils/motion";

// v-reveal: an element comes into view as it's scrolled to -- what AOS
// does, in a few lines and without the dependency. The motion itself is
// CSS (the .reveal classes in style.css); this only decides when.
//
//   v-reveal                        fade up, right away
//   v-reveal="'zoom'"               another variant
//   v-reveal="{ variant: 'slide-left', delay: 150 }"
//   v-reveal.stagger="{ step: 80 }" each child in turn, not the element
//
// Variants: fade-up (default), fade-in, zoom, slide-left, slide-right.
// Each element reveals once. With reduced motion, or without
// IntersectionObserver, everything is simply there.

export const REVEAL_VARIANTS = [
  "fade-up",
  "fade-in",
  "zoom",
  "slide-left",
  "slide-right",
];
const DEFAULT_STAGGER_STEP = 80;
// Long grids shouldn't keep their last items waiting
const MAX_STAGGER_DELAY = 600;

const optionsOf = (value) => {
  const options = typeof value === "string" ? { variant: value } : { ...(value ?? {}) };
  if (!REVEAL_VARIANTS.includes(options.variant)) options.variant = "fade-up";
  return options;
};

// The elements that animate: the children for a stagger, else itself
const targetsOf = (el, binding) => (binding.modifiers.stagger ? [...el.children] : [el]);

const reveal = (target) => target.classList.add("is-revealed");

let observer = null;
// Shared by every v-reveal on the page: one observer, not one per element
const getObserver = () => {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        for (const target of entry.target.__revealTargets ?? []) reveal(target);
      }
    },
    // A little into the viewport, so it's seen arriving rather than
    // already done by the time it's on screen
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  return observer;
};

export const revealDirective = {
  mounted(el, binding) {
    const options = optionsOf(binding.value);
    const targets = targetsOf(el, binding);

    targets.forEach((target, index) => {
      target.classList.add("reveal", `reveal-${options.variant}`);
      const delay = binding.modifiers.stagger
        ? Math.min(
            (options.delay ?? 0) + index * (options.step ?? DEFAULT_STAGGER_STEP),
            MAX_STAGGER_DELAY
          )
        : (options.delay ?? 0);
      if (delay) target.style.transitionDelay = `${delay}ms`;
    });

    const io = prefersReducedMotion() ? null : getObserver();
    if (!io) {
      targets.forEach(reveal);
      return;
    }
    el.__revealTargets = targets;
    io.observe(el);
  },

  unmounted(el) {
    observer?.unobserve(el);
    delete el.__revealTargets;
  },
};

// For tests: forget the shared observer
export const resetRevealObserver = () => {
  observer?.disconnect();
  observer = null;
};
