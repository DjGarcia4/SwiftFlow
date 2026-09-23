import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useHistoryStore } from "@/features/history/store";
import {
  DEFAULT_REWARDS,
  REWARD_KINDS,
  effectiveReward,
} from "@/features/history/utils/rewards";

const STORAGE_KEY = "swiftflow_customization";

const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      REWARD_KINDS.map((kind) => [
        kind,
        typeof parsed?.[kind] === "string" ? parsed[kind] : DEFAULT_REWARDS[kind],
      ])
    );
  } catch {
    return { ...DEFAULT_REWARDS };
  }
};

// What you've picked from the rewards levels unlock: accent color, caret
// and keystroke sound. What's *chosen* is kept as chosen; what's *used* is
// checked against the level every time, so a cleared history puts the
// defaults back without losing the choice for when it's earned again.
export const useCustomizationStore = defineStore("customization", () => {
  const historyStore = useHistoryStore();
  const chosen = ref(load());

  const level = computed(() => historyStore.level.level);
  const accent = computed(() =>
    effectiveReward("accent", chosen.value.accent, level.value)
  );
  const caret = computed(() => effectiveReward("caret", chosen.value.caret, level.value));
  const sound = computed(() => effectiveReward("sound", chosen.value.sound, level.value));

  const choose = (kind, id) => {
    chosen.value = { ...chosen.value, [kind]: id };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chosen.value));
    } catch {
      // Storage blocked: the choice still holds for this visit
    }
  };

  // The accent is a whole-app theme, so it's applied at the root; the
  // default is the stylesheet's own colors, with no attribute at all.
  watch(
    accent,
    (id) => {
      if (id === DEFAULT_REWARDS.accent) {
        delete document.documentElement.dataset.accent;
      } else {
        document.documentElement.dataset.accent = id;
      }
    },
    // Right away, not on the next tick: a theme change shouldn't lag a frame
    { immediate: true, flush: "sync" }
  );

  return { chosen, accent, caret, sound, level, choose };
});
