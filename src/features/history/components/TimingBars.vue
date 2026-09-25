<template>
  <div>
    <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-3">
      {{ title }}
    </div>

    <div class="space-y-1.5">
      <!-- The bar is the ratio, not the raw time: "slower than your own
           middle key" is the thing worth reading -->
      <div
        class="flex items-center gap-3 mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
      >
        <span class="min-w-[4.5rem] text-center">{{
          unitLabel ?? t("history.timing.key")
        }}</span>
        <span class="flex-1">{{ t("history.timing.slowerThanUsual") }}</span>
        <span class="w-20 text-right">ms</span>
      </div>

      <div
        v-for="(stat, index) in visible"
        :key="stat.key ?? stat.pair"
        class="flex items-center gap-3 animate-rise"
        :style="staggerStyle(index, { step: 50, base: 500 })"
      >
        <kbd
          class="min-w-[4.5rem] px-2 py-0.5 text-center bg-primary-tint text-primary rounded-md font-mono text-sm font-extrabold border-2 border-primary/30"
          >{{ labelFor(stat) }}</kbd
        >
        <div class="flex-1 h-2 rounded-full bg-faded-gray/40 overflow-hidden">
          <div
            class="h-full rounded-full bg-primary origin-left animate-grow-x"
            :style="{
              width: `${(stat.ratio / visible[0].ratio) * 100}%`,
              ...staggerStyle(index, { step: 50, base: 600 }),
            }"
          ></div>
        </div>
        <div class="w-20 text-right text-xs text-pencil-gray font-bold tabular-nums">
          {{ stat.meanMs }} · {{ formatRatio(stat.ratio) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { formatKeyLabel, formatPairLabel } from "@/features/history/utils/historyStats";
import { staggerStyle } from "@/shared/utils/motion";

const props = defineProps({
  // Output of computeKeyTimingStats or computeBigramTimingStats
  stats: { type: Array, required: true },
  title: { type: String, required: true },
  // The key's by default
  unitLabel: { type: String, default: null },
});

const SHOWN = 6;

const visible = computed(() => props.stats.slice(0, SHOWN));

const labelFor = (stat) =>
  stat.pair ? formatPairLabel(stat.pair) : formatKeyLabel(stat.key);

// "+42%" reads as the gap; a bare ratio of 1.42 doesn't
const formatRatio = (ratio) => `+${Math.round((ratio - 1) * 100)}%`;
</script>
