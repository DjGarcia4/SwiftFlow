import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import {
  loadTextAppearance,
  saveTextAppearance,
  sanitizeTextAppearance,
  optionOf,
} from "@/shared/utils/textAppearance";

export const useTextAppearanceStore = defineStore("textAppearance", () => {
  const appearance = ref(loadTextAppearance());

  // Bumped once the picked font's files arrive, so whatever measured the
  // text with the fallback font can measure it again
  const fontsLoaded = ref(0);

  const set = (field, id) => {
    appearance.value = sanitizeTextAppearance({ ...appearance.value, [field]: id });
    saveTextAppearance(appearance.value);
  };

  watch(
    () => appearance.value.font,
    async (id) => {
      const font = optionOf("font", id);
      if (!font.load) return;
      try {
        await font.load();
        await document.fonts?.ready;
      } catch {
        // Offline before it was ever loaded: the fallback font stands in
      }
      fontsLoaded.value++;
    },
    { immediate: true }
  );

  const caretGlides = computed(() => appearance.value.caretMotion === "smooth");
  const focusMode = computed(() => appearance.value.focus === "on");

  return { appearance, fontsLoaded, caretGlides, focusMode, set };
});
