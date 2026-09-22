<template>
  <!--
    Where the experience stands: the level, a bar toward the next one and,
    on the results screen, what the session just added -- the bar starts
    where it was before and fills up to where it is now.
  -->
  <div class="flex items-center gap-3">
    <div
      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold text-white"
      :class="{ 'animate-key-pop': leveledUp }"
      :style="{ backgroundColor: GOLD }"
    >
      {{ level.level }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline justify-between gap-2 mb-1.5">
        <span class="text-sm font-extrabold text-charcoal">
          {{ leveledUp ? `¡Nivel ${level.level}!` : `Nivel ${level.level}` }}
          <span class="font-bold text-pencil-gray">· {{ level.title }}</span>
        </span>
        <span class="text-xs font-bold tabular-nums text-pencil-gray">
          <span v-if="gained" class="font-extrabold" :style="{ color: GOLD }"
            >+{{ gained }} XP ·
          </span>
          {{ level.xpIntoLevel }}/{{ level.xpForNextLevel }}
        </span>
      </div>
      <div class="h-2.5 rounded-full bg-faded-gray/40 overflow-hidden">
        <div
          class="h-full rounded-full transition-[width] duration-1000 ease-smooth"
          :style="{ width: `${shownFraction * 100}%`, backgroundColor: GOLD }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useHistoryStore } from "@/features/history/store";
import { levelFromXp } from "@/features/history/utils/experience";

const props = defineProps({
  // XP the session just earned; 0 when just showing where things stand
  gained: { type: Number, default: 0 },
});

const GOLD = "rgb(202 138 4)";

const historyStore = useHistoryStore();
const level = computed(() => historyStore.level);
const leveledUp = computed(
  () =>
    props.gained > 0 &&
    levelFromXp(historyStore.experience - props.gained).level < level.value.level
);

// Starts from before the session (or from empty on a new level) and grows
// to the current fill once it's on screen, so the gain reads as movement.
const startFraction = () => {
  if (!props.gained) return level.value.fraction;
  if (leveledUp.value) return 0;
  return levelFromXp(historyStore.experience - props.gained).fraction;
};
const shownFraction = ref(startFraction());

// Anything earned while this stays on screen just moves the bar along
watch(
  () => level.value.fraction,
  (fraction) => {
    shownFraction.value = fraction;
  }
);

onMounted(() => {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      shownFraction.value = level.value.fraction;
    })
  );
});
</script>

<style scoped>
@keyframes key-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

.animate-key-pop {
  animation: key-pop 400ms ease-out 600ms;
}
</style>
