<template>
  <!-- Keyed by achievement so a queued one leaves before the next pops in.
       Completed daily challenges share this queue, with their own kicker. -->
  <Transition
    mode="out-in"
    enter-active-class="transition-all duration-600 ease-spring"
    enter-from-class="opacity-0 -translate-y-6 scale-75"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-3 scale-95"
  >
    <div
      v-if="achievement"
      :key="achievement.id"
      class="fixed top-20 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-card border-2 px-4 py-3 shadow-xl cursor-pointer transition-[scale] duration-200 ease-spring hover:scale-105"
      :style="achievementSolidStyle(achievement)"
      @click="historyStore.dismissNewlyUnlocked()"
    >
      <component
        :is="ACHIEVEMENT_ICONS[achievement.icon]"
        class="w-8 h-8 flex-shrink-0 animate-pop-in [animation-delay:200ms]"
      />
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wide opacity-80">
          {{ achievement.kicker ?? "¡Logro desbloqueado!" }}
        </div>
        <div class="font-display font-extrabold leading-tight">
          {{ achievement.title }}
        </div>
        <div v-if="achievement.subtitle" class="mt-0.5 text-xs font-bold opacity-90">
          {{ achievement.subtitle }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useHistoryStore } from "@/features/history/store";
import { useConfigStore } from "@/features/typing-test/store";
import {
  ACHIEVEMENT_ICONS,
  achievementSolidStyle,
} from "@/features/history/achievementPresentation";
import { useSoundStore } from "@/shared/stores/sound";
import { playCelebrationSound } from "@/shared/utils/sound";

const historyStore = useHistoryStore();
const soundStore = useSoundStore();
const configStore = useConfigStore();
const route = useRoute();

// Nothing pops up over the text while you're typing it: a toast earned by
// the last session waits (queued, not dismissed) until this one is over or
// on hold, then shows as usual.
const typing = computed(
  () =>
    route.name === "home" &&
    configStore.userInput.length > 0 &&
    !configStore.isCompleted &&
    !configStore.isPaused
);

const achievement = computed(() =>
  typing.value ? null : (historyStore.newlyUnlocked[0] ?? null)
);

const DISPLAY_MS = 4000;
let dismissTimeout = null;
let lastCelebrated = null;

watch(
  achievement,
  (current) => {
    clearTimeout(dismissTimeout);
    if (current) {
      // Once per toast: one held back during typing comes back quietly
      if (
        current.id !== lastCelebrated &&
        soundStore.soundEnabled &&
        soundStore.celebrationSound
      ) {
        playCelebrationSound();
      }
      lastCelebrated = current.id;
      dismissTimeout = setTimeout(() => {
        historyStore.dismissNewlyUnlocked();
      }, DISPLAY_MS);
    }
  },
  { immediate: true }
);

onUnmounted(() => clearTimeout(dismissTimeout));
</script>
