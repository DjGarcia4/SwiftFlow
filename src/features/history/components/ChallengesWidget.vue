<template>
  <!--
    The day's challenges, kept one glance away on the typing screen: a pill
    with the count done, opening into the full list. Out of the way while
    typing, same as the toolbar.
  -->
  <div
    ref="root"
    class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 transition-[opacity,translate] duration-500 ease-smooth"
    :class="
      hidden
        ? 'opacity-0 translate-y-3 pointer-events-none select-none duration-300'
        : 'opacity-100 translate-y-0'
    "
    :aria-hidden="hidden"
  >
    <Transition
      enter-active-class="transition-[opacity,translate,scale] duration-400 ease-spring origin-bottom-right"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-[opacity,translate,scale] duration-150 ease-in origin-bottom-right"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="open"
        class="w-[min(22rem,calc(100vw-2rem))] rounded-card border-2 border-faded-gray bg-paper-white p-4 shadow-xl"
      >
        <div class="flex items-baseline justify-between gap-2 mb-3">
          <div class="font-display font-extrabold text-charcoal">Retos de hoy</div>
          <div class="text-[10px] font-bold uppercase tracking-wide text-pencil-gray">
            {{ historyStore.challengeStats.completed }}
            {{ historyStore.challengeStats.completed === 1 ? "cumplido" : "cumplidos" }}
            en total
          </div>
        </div>
        <ReviewToday
          v-if="historyStore.reviewToday.keys.length"
          class="mb-2"
          @play="open = false"
        />
        <DailyChallengesList :challenges="challenges" @play="open = false" />
        <p v-if="allDone" class="mt-3 text-center text-xs font-bold text-success-dark">
          ¡Día redondo! Mañana hay retos nuevos.
        </p>

        <div class="mt-4 pt-4 border-t-2 border-faded-gray">
          <WeeklyGoal compact />
        </div>
      </div>
    </Transition>

    <button
      type="button"
      class="relative flex h-12 items-center gap-2 rounded-full border-2 px-4 text-sm font-extrabold shadow-sm transition-[scale,border-color,background-color,color] duration-300 ease-spring hover:scale-105 active:scale-95"
      :class="
        allDone
          ? 'border-success bg-success-tint text-success-dark'
          : 'border-faded-gray bg-paper-white text-charcoal'
      "
      :aria-expanded="open"
      :aria-label="`Retos de hoy: ${doneCount} de ${challenges.length}`"
      @click="open = !open"
    >
      <FlagIcon class="w-5 h-5" :class="allDone ? '' : 'text-primary'" />
      <span class="hidden xs:inline">Retos</span>
      <span class="tabular-nums">{{ doneCount }}/{{ challenges.length }}</span>
      <!-- A review waiting doesn't change the count, so it gets a dot -->
      <span
        v-if="reviewPending"
        class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-paper-white bg-primary"
      ></span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { FlagIcon } from "@heroicons/vue/24/outline";
import DailyChallengesList from "./DailyChallengesList.vue";
import WeeklyGoal from "./WeeklyGoal.vue";
import ReviewToday from "./ReviewToday.vue";
import { useHistoryStore } from "@/features/history/store";
import { useConfigStore } from "@/features/typing-test/store";
import { msUntilNextDay } from "@/features/history/dailyChallenges";

const historyStore = useHistoryStore();
const configStore = useConfigStore();
const root = ref(null);
const open = ref(false);

const challenges = computed(() => historyStore.dailyChallenges);
const doneCount = computed(() => challenges.value.filter((c) => c.completed).length);
const allDone = computed(() => doneCount.value === challenges.value.length);
const reviewPending = computed(
  () => historyStore.reviewToday.keys.length > 0 && !historyStore.reviewToday.completed
);

const hidden = computed(
  () =>
    configStore.userInput.length > 0 && !configStore.isCompleted && !configStore.isPaused
);

watch(hidden, (isHidden) => {
  if (isHidden) open.value = false;
});

// Closes on a click anywhere else, or Esc -- without swallowing that Esc,
// which the typing view uses to pause.
const handlePointerDown = (event) => {
  if (open.value && !root.value?.contains(event.target)) open.value = false;
};
const handleKeydown = (event) => {
  if (event.key === "Escape") open.value = false;
};

// A tab left open overnight should wake up to the new day's list
let midnightTimeout = null;
const scheduleMidnight = () => {
  clearTimeout(midnightTimeout);
  midnightTimeout = setTimeout(() => {
    historyStore.refreshDay();
    scheduleMidnight();
  }, msUntilNextDay() + 1000);
};
const handleFocus = () => historyStore.refreshDay();

onMounted(() => {
  historyStore.refreshDay();
  scheduleMidnight();
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("focus", handleFocus);
});

onUnmounted(() => {
  clearTimeout(midnightTimeout);
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("focus", handleFocus);
});
</script>
