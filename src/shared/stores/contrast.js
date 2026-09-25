import { defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "swiftflow_contrast";

// High contrast (style.css, `data-contrast`): the OS's "increase contrast"
// until it's switched here, and then whatever was picked
export const useContrastStore = defineStore("contrast", () => {
  const readStored = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const prefersMore = window.matchMedia?.("(prefers-contrast: more)");
  const stored = readStored();
  const high = ref(stored ? stored === "more" : Boolean(prefersMore?.matches));

  prefersMore?.addEventListener?.("change", (event) => {
    if (!readStored()) high.value = event.matches;
  });

  watch(
    high,
    (value) => {
      if (value) document.documentElement.dataset.contrast = "more";
      else delete document.documentElement.dataset.contrast;
    },
    { immediate: true, flush: "sync" }
  );

  const setHigh = (value) => {
    high.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? "more" : "normal");
    } catch {
      // Storage blocked: it still holds for this visit
    }
  };

  return { high, setHigh };
});
