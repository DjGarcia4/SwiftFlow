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
        ref="panel"
        class="w-[min(22rem,calc(100vw-2rem))] rounded-card border-2 border-faded-gray bg-paper-white p-4 shadow-xl"
      >
        <div class="flex items-baseline justify-between gap-2 mb-3">
          <div class="font-display font-extrabold text-charcoal">
            {{ t("history.challengesWidget.title") }}
          </div>
          <div class="text-[10px] font-bold uppercase tracking-wide text-pencil-gray">
            {{
              t("history.challengesWidget.total", historyStore.challengeStats.completed)
            }}
          </div>
        </div>
        <ReviewToday
          v-if="historyStore.reviewToday.keys.length"
          class="mb-2"
          @play="open = false"
        />
        <DailyChallengesList :challenges="challenges" @play="open = false" />
        <p v-if="allDone" class="mt-3 text-center text-xs font-bold text-success-dark">
          {{ t("history.challengesWidget.fullDay") }}
        </p>

        <WeeklyChallengeCard class="mt-2" @play="open = false" />

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
      :aria-label="t('history.challengesWidget.aria', doneCount, challenges.length)"
      :aria-keyshortcuts="hotkeyAria"
      @click="open = !open"
    >
      <FlagIcon class="w-5 h-5" :class="allDone ? '' : 'text-primary'" />
      <span class="hidden xs:inline">{{ t("history.challengesWidget.short") }}</span>
      <span class="tabular-nums">{{ doneCount }}/{{ challenges.length }}</span>
      <KeyHint id="challenges" small />
      <!-- A review waiting doesn't change the count, so it gets a dot -->
      <span
        v-if="reviewPending"
        class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-paper-white bg-primary"
      ></span>
    </button>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { FlagIcon } from "@heroicons/vue/24/outline";
import DailyChallengesList from "./DailyChallengesList.vue";
import WeeklyGoal from "./WeeklyGoal.vue";
import ReviewToday from "./ReviewToday.vue";
import WeeklyChallengeCard from "./WeeklyChallengeCard.vue";
import { useHistoryStore } from "@/features/history/store";
import { useConfigStore } from "@/features/typing-test/store";
import { msUntilNextDay } from "@/features/history/dailyChallenges";
import { usePaletteStore } from "@/features/command-palette/store";
import { useHotkey } from "@/features/command-palette/hotkeys";
import { focusableIn } from "@/shared/composables/useModalFocus";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";

const historyStore = useHistoryStore();
const configStore = useConfigStore();
const palette = usePaletteStore();
const root = ref(null);
const panel = ref(null);
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

// Opened from the keyboard, the focus goes in with it, so Tab walks the
// challenges and Enter plays one
const openFromKeyboard = async () => {
  open.value = true;
  await nextTick();
  focusableIn(panel.value)[0]?.focus({ preventScroll: true });
};

// "L" (Logros) beside the pill, and in the palette from any page
const { aria: hotkeyAria } = useHotkey("challenges", {
  key: "l",
  inPalette: false,
  enabled: () => !hidden.value,
  run: () => (open.value ? (open.value = false) : openFromKeyboard()),
});

watch(
  () => palette.challengesRequested,
  (requested) => {
    if (requested && palette.takeChallengesRequest()) openFromKeyboard();
  },
  { immediate: true }
);

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
