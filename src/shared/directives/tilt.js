import { prefersReducedMotion } from "@/shared/utils/motion";

// v-tilt: a card leaning a few degrees toward the pointer, for the
// landing's grid. Only with a mouse (a touch has nothing to follow), and
// not with reduced motion. v-tilt="6" sets the most it leans, in degrees.

const DEFAULT_MAX_DEG = 5;

export const tiltDirective = {
  mounted(el, binding) {
    if (prefersReducedMotion() || !window.matchMedia?.("(pointer: fine)").matches) return;
    const max = Number(binding.value) || DEFAULT_MAX_DEG;

    const move = (event) => {
      const rect = el.getBoundingClientRect();
      // -0.5..0.5 from the center, each way
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    };
    const leave = () => {
      el.style.transform = "";
    };

    // Keeps the opacity fade v-reveal gives the same element; only the
    // transform gets quicker, to follow the pointer
    el.style.transition =
      "opacity 700ms var(--ease-smooth), transform 300ms var(--ease-smooth)";
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.__tiltCleanup = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  },
  unmounted(el) {
    el.__tiltCleanup?.();
  },
};
