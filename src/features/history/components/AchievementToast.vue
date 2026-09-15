<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-3 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-3 scale-95"
  >
    <div
      v-if="achievement"
      class="fixed top-20 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-card border-2 px-4 py-3 shadow-lg cursor-pointer"
      :style="achievementSolidStyle(achievement)"
      @click="historyStore.dismissNewlyUnlocked()"
    >
      <component
        :is="ACHIEVEMENT_ICONS[achievement.icon]"
        class="w-8 h-8 flex-shrink-0"
      />
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wide opacity-80">
          ¡Logro desbloqueado!
        </div>
        <div class="font-display font-extrabold leading-tight">
          {{ achievement.title }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onUnmounted } from "vue";
import { useHistoryStore } from "@/features/history/store";
import {
  ACHIEVEMENT_ICONS,
  achievementSolidStyle,
} from "@/features/history/achievementPresentation";
import { useSoundStore } from "@/shared/stores/sound";
import { playCelebrationSound } from "@/shared/utils/sound";

const historyStore = useHistoryStore();
const soundStore = useSoundStore();
const achievement = computed(() => historyStore.newlyUnlocked[0] ?? null);

const DISPLAY_MS = 4000;
let dismissTimeout = null;

watch(
  achievement,
  (current) => {
    clearTimeout(dismissTimeout);
    if (current) {
      if (soundStore.soundEnabled && soundStore.celebrationSound) {
        playCelebrationSound();
      }
      dismissTimeout = setTimeout(() => {
        historyStore.dismissNewlyUnlocked();
      }, DISPLAY_MS);
    }
  },
  { immediate: true }
);

onUnmounted(() => clearTimeout(dismissTimeout));
</script>
