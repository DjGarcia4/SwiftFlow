<template>
  <!--
    The live combo as a bar that fills toward the next milestone, so every
    correct key visibly counts and a mistake visibly costs: the bar drains
    and flashes red. Takes whatever width the header row leaves it.
  -->
  <div
    class="flex items-center gap-2.5 sm:gap-3"
    :class="{ 'animate-combo-break': breaking }"
    role="meter"
    :aria-valuenow="streak"
    :aria-valuemin="progress.from"
    :aria-valuemax="progress.next ?? streak"
    :aria-label="`Combo de ${streak}`"
  >
    <FireIcon
      class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-colors duration-300"
      :class="{ 'animate-badge-glow': streak >= FIRST_MILESTONE_HINT }"
      :style="{ color: breaking ? DANGER : flame }"
    />
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline justify-between gap-2 leading-none mb-1.5">
        <span
          :key="progress.from"
          class="text-sm sm:text-base font-extrabold tabular-nums"
          :class="{ 'animate-key-pop': progress.from > 0 }"
          :style="{ color: breaking ? DANGER : flame }"
          >x{{ streak }}</span
        >
        <span
          v-if="progress.next"
          class="text-[11px] sm:text-xs font-bold tabular-nums text-pencil-gray"
          ><span class="hidden sm:inline">próximo: </span>{{ progress.next }}</span
        >
      </div>
      <div class="h-2 sm:h-2.5 rounded-full bg-faded-gray/40 overflow-hidden">
        <div
          class="h-full rounded-full transition-[width,background-color] ease-out"
          :class="breaking ? 'duration-500' : 'duration-150'"
          :style="{
            width: `${progress.fraction * 100}%`,
            backgroundColor: breaking ? DANGER : flame,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { FireIcon } from "@heroicons/vue/24/solid";
import { useConfigStore } from "@/features/typing-test/store";
import { getCharacterStreakColorRgb } from "@/shared/utils/flameColor";
import { comboProgress } from "@/features/typing-test/utils/comboMilestones";

const DANGER = "var(--color-danger)";
// The flame starts flickering once the combo is worth protecting
const FIRST_MILESTONE_HINT = 15;
// Losing a combo this short isn't worth a red flash
const MIN_BREAK_FLASH = 5;
const BREAK_MS = 450;

const configStore = useConfigStore();
const streak = computed(() => configStore.currentStreak);
const progress = computed(() => comboProgress(streak.value));

const flame = computed(() => {
  // Below the ramp's first stop it would already be amber, which reads as
  // "on fire" for a combo of two; stay neutral until it's earned.
  if (streak.value < FIRST_MILESTONE_HINT) return "var(--color-primary)";
  const [r, g, b] = getCharacterStreakColorRgb(streak.value);
  return `rgb(${r} ${g} ${b})`;
});

const breaking = ref(false);
let breakTimeout = null;

watch(streak, (next, previous) => {
  if (next === 0 && previous >= MIN_BREAK_FLASH) {
    breaking.value = true;
    clearTimeout(breakTimeout);
    breakTimeout = setTimeout(() => {
      breaking.value = false;
    }, BREAK_MS);
  } else if (next > 0) {
    breaking.value = false;
  }
});

onUnmounted(() => clearTimeout(breakTimeout));
</script>

<style scoped>
@keyframes combo-break {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-3px);
  }
  40% {
    transform: translateX(3px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
}

.animate-combo-break {
  animation: combo-break 300ms ease-out;
}

@keyframes key-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-key-pop {
  display: inline-block;
  animation: key-pop 260ms ease-out;
}

@keyframes badge-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

.animate-badge-glow {
  animation: badge-glow 1.6s ease-in-out infinite;
}
</style>
