import { defineStore } from "pinia";
import { ref, watch } from "vue";

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

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggleTheme };
});
