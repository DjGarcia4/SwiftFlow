import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { prefersReducedMotion } from "@/shared/utils/motion";

const STORAGE_KEY = "swiftflow_theme";

const applyTheme = (isDark) => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
};

export const useThemeStore = defineStore("theme", () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const isDark = ref(stored ? stored === "dark" : prefersDark.matches);
  applyTheme(isDark.value);

  // Keep following the OS setting for as long as the user hasn't chosen one
  prefersDark.addEventListener("change", (event) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      isDark.value = event.matches;
    }
  });

  watch(isDark, (value) => {
    applyTheme(value);
    localStorage.setItem(STORAGE_KEY, value ? "dark" : "light");
  });

  // Where the reveal circle starts: the pointer for a click, or the center
  // of the button when it was activated from the keyboard (no coordinates).
  const revealOrigin = (event) => {
    if (event?.detail > 0) return { x: event.clientX, y: event.clientY };
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    if (rect) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  };

  const toggleTheme = (event) => {
    const flip = () => {
      isDark.value = !isDark.value;
      // Applied right away (not left to the watcher) so the view transition
      // captures the new theme in its "after" snapshot.
      applyTheme(isDark.value);
    };

    if (!document.startViewTransition || prefersReducedMotion()) {
      flip();
      return;
    }

    const { x, y } = revealOrigin(event);
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(flip);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return { isDark, toggleTheme };
});
