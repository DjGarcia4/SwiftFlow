<template>
  <div>
    <!-- Keyboard: each key tinted by its miss rate, relative to the worst key -->
    <KeyboardLayout
      class="hidden sm:flex mb-4"
      :key-class="keyClass"
      :key-style="
        (key, rowIndex, keyIndex) => ({
          ...keyStyle(key),
          ...keyStagger(rowIndex, keyIndex),
        })
      "
    >
      <template #tooltip="{ char }">
        <div
          v-if="statsByKey.get(char)"
          class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 rounded-xl bg-night-ink px-3 py-1.5 font-sans text-xs font-bold normal-case text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          {{ describe(statsByKey.get(char)) }}
        </div>
      </template>
    </KeyboardLayout>

    <!-- Ranking: works for every key, including symbols off the keyboard above -->
    <div v-if="topMissed.length" class="space-y-1.5">
      <!-- The two numbers tell different stories (the most-missed key is
           usually just the most-typed one), so they're labelled -->
      <div
        class="flex items-center gap-3 mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
      >
        <span class="min-w-[4.5rem] text-center">{{ t("history.heatmap.key") }}</span>
        <span class="flex-1">{{ t("history.heatmap.totalMisses") }}</span>
        <span class="w-28 text-right">{{ t("history.heatmap.missesAndRate") }}</span>
      </div>
      <div
        v-for="(stat, index) in topMissed"
        :key="stat.key"
        class="flex items-center gap-3 animate-rise"
        :style="staggerStyle(index, { step: 50, base: 500 })"
      >
        <kbd
          class="min-w-[4.5rem] px-2 py-0.5 text-center bg-danger-tint text-danger rounded-md font-mono text-sm font-extrabold border-2 border-danger/30"
          >{{ formatKeyLabel(stat.key) }}</kbd
        >
        <div class="flex-1 h-2 rounded-full bg-faded-gray/40 overflow-hidden">
          <div
            class="h-full rounded-full bg-danger origin-left animate-grow-x"
            :style="{
              width: `${(stat.misses / topMissed[0].misses) * 100}%`,
              ...staggerStyle(index, { step: 50, base: 600 }),
            }"
          ></div>
        </div>
        <div class="w-28 text-right text-xs text-pencil-gray font-bold tabular-nums">
          {{ stat.misses }} · {{ Math.round(stat.rate * 100) }}%
        </div>
      </div>
    </div>
    <div v-else class="text-sm text-pencil-gray text-center">
      {{ t("history.heatmap.none") }}
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { formatKeyLabel } from "@/features/history/utils/historyStats";
import { staggerStyle } from "@/shared/utils/motion";
import KeyboardLayout from "@/features/typing-test/components/KeyboardLayout.vue";

const props = defineProps({
  // Output of computeKeyErrorStats: [{ key, attempts, misses, rate }]
  stats: { type: Array, required: true },
  // Output of computeKeyTrends, or null: adds "antes" to the tooltips
  trends: { type: Object, default: null },
});

const trendByKey = computed(
  () => new Map((props.trends?.all ?? []).map((trend) => [trend.key, trend]))
);

const TOP_MISSED_COUNT = 8;

const statsByKey = computed(() => new Map(props.stats.map((s) => [s.key, s])));

const topMissed = computed(() =>
  props.stats.filter((s) => s.misses > 0).slice(0, TOP_MISSED_COUNT)
);

const maxRate = computed(() => Math.max(0, ...props.stats.map((s) => s.rate)));

const keyClass = (key) =>
  `animate-pop-in transition-[scale] duration-200 ease-spring hover:scale-110 ${
    key === " "
      ? "text-pencil-gray"
      : statsByKey.value.get(key)
        ? "text-charcoal"
        : "text-pencil-gray/50"
  }`;

const keyStyle = (key) => {
  const stat = statsByKey.value.get(key);
  if (!stat || !stat.misses || !maxRate.value) {
    return { borderColor: "var(--color-faded-gray)" };
  }

  // 15%..75% of the danger color, so even the least-missed key reads as "some"
  const strength = Math.round(15 + (stat.rate / maxRate.value) * 60);
  return {
    backgroundColor: `color-mix(in srgb, var(--color-danger) ${strength}%, transparent)`,
    borderColor: `color-mix(in srgb, var(--color-danger) ${Math.min(strength + 20, 100)}%, transparent)`,
  };
};

// Keys ripple in diagonally: left-to-right, and each row a bit later
const keyStagger = (rowIndex, keyIndex) =>
  staggerStyle(rowIndex + keyIndex, { step: 22, base: 550, max: 1000 });

const describe = (stat) => {
  const trend = trendByKey.value.get(stat.key);
  const before = trend ? t("history.heatmap.before", Math.round(trend.before * 100)) : "";
  return t(
    "history.heatmap.describe",
    stat.misses,
    stat.attempts,
    Math.round(stat.rate * 100),
    before
  );
};
</script>
