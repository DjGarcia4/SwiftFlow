<template>
  <!--
    Sits where the (hidden while typing) toolbar normally is, so it never
    covers the text. pointer-events-none: it must never steal a click or
    the focus from the typing input.
  -->
  <div
    class="fixed top-20 sm:top-24 left-1/2 z-30 -translate-x-1/2 pointer-events-none"
    aria-live="polite"
  >
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,translate,scale] duration-500 ease-spring"
      enter-from-class="opacity-0 translate-y-4 scale-75"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-[opacity,translate,scale] duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-3 scale-90"
    >
      <div
        v-if="push"
        :key="push.id"
        class="flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 shadow-xl backdrop-blur-sm whitespace-nowrap"
        :style="pushStyle"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl text-white animate-pop-in [animation-delay:120ms]"
          :style="{ backgroundColor: flameColor }"
        >
          <FireIcon class="w-6 h-6 animate-combo-flicker" />
        </div>
        <div class="leading-tight">
          <div
            class="font-display text-xl font-extrabold tabular-nums"
            :style="{ color: flameColor }"
          >
            x{{ push.milestone }}
          </div>
          <div class="text-sm font-extrabold text-charcoal">{{ push.message }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { FireIcon } from "@heroicons/vue/24/solid";
import { useConfigStore } from "@/features/typing-test/store";
import { getCharacterStreakColorRgb } from "@/shared/utils/flameColor";
import {
  detectComboMilestone,
  pickComboMessage,
} from "@/features/typing-test/utils/comboMilestones";

const DISPLAY_MS = 1800;

const configStore = useConfigStore();
const push = ref(null);
let celebratedOnce = new Set();
let hideTimeout = null;
let nextId = 0;

const hide = () => {
  clearTimeout(hideTimeout);
  push.value = null;
};

watch(
  () => configStore.currentStreak,
  (streak, previousStreak) => {
    // Sin red: a combo cheered, or not, would say whether you slipped
    if (configStore.blindMode) return;
    const milestone = detectComboMilestone(previousStreak, streak, celebratedOnce);
    if (!milestone) return;

    celebratedOnce.add(milestone);
    push.value = { id: nextId++, milestone, message: pickComboMessage(milestone) };
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hide, DISPLAY_MS);
  }
);

// Nothing to cheer once the session is over or on hold; a fresh session
// (input cleared) earns its early milestones again.
watch(
  () => configStore.isCompleted || configStore.isPaused,
  (stopped) => {
    if (stopped) hide();
  }
);

watch(
  () => configStore.userInput.length === 0,
  (empty) => {
    if (empty) {
      celebratedOnce = new Set();
      hide();
    }
  }
);

onUnmounted(() => clearTimeout(hideTimeout));

// Same amber -> orange -> red ramp as the in-session streak badge
const flameColor = computed(() => {
  const [r, g, b] = getCharacterStreakColorRgb(push.value?.milestone ?? 0);
  return `rgb(${r} ${g} ${b})`;
});

const pushStyle = computed(() => {
  const [r, g, b] = getCharacterStreakColorRgb(push.value?.milestone ?? 0);
  return {
    borderColor: `rgb(${r} ${g} ${b})`,
    backgroundColor: `color-mix(in srgb, var(--color-paper-white) 88%, rgb(${r} ${g} ${b}))`,
    boxShadow: `0 10px 30px -8px rgba(${r}, ${g}, ${b}, 0.55)`,
  };
});
</script>

<style scoped>
/* The flame never sits still while the push is up */
@keyframes combo-flicker {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.12) rotate(-6deg);
  }
  50% {
    transform: scale(0.95) rotate(4deg);
  }
  75% {
    transform: scale(1.08) rotate(-3deg);
  }
}

.animate-combo-flicker {
  animation: combo-flicker 700ms ease-in-out infinite;
}
</style>
