<template>
  <!-- After a drill: how each letter did against last time, and when it's
       coming back -->
  <div class="rounded-card border-2 border-faded-gray bg-paper-white px-4 py-3">
    <div
      class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-pencil-gray"
    >
      <ArrowPathRoundedSquareIcon class="w-4 h-4 text-primary" />
      Repaso
    </div>
    <ul class="space-y-1.5">
      <li v-for="change in changes" :key="change.key" class="flex items-center gap-2.5">
        <kbd
          class="w-8 flex-shrink-0 rounded-md border-2 border-primary/30 bg-primary-tint py-0.5 text-center font-mono text-sm font-extrabold uppercase text-primary"
          >{{ change.key }}</kbd
        >
        <span class="text-sm font-extrabold tabular-nums text-charcoal">
          <!-- No earlier rate to compare with the first time, just this one -->
          <template v-if="change.fromRate !== change.toRate">
            {{ percent(change.fromRate) }}
            <span class="text-pencil-gray">→</span>
          </template>
          <span :class="trendClass(change)">{{ percent(change.toRate) }}</span>
        </span>
        <span class="min-w-0 truncate text-xs font-bold text-pencil-gray">
          {{ describe(change) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ArrowPathRoundedSquareIcon } from "@heroicons/vue/24/outline";

defineProps({
  // applyDrillSession's changes
  changes: { type: Array, required: true },
});

const percent = (rate) => `${Math.round(rate * 100)}%`;

const trendClass = (change) =>
  change.toRate < change.fromRate
    ? "text-success"
    : change.toRate > change.fromRate
      ? "text-danger"
      : "text-charcoal";

const inDays = (days) => (days === 1 ? "mañana" : days === 0 ? "hoy" : `en ${days} días`);

const describe = (change) => {
  switch (change.outcome) {
    case "started":
      return `en repaso · vuelve ${inDays(change.nextInDays)}`;
    case "advanced":
      return `¡bien! · próximo repaso ${inDays(change.nextInDays)}`;
    case "repeated":
      return `igual · otra vez ${inDays(change.nextInDays)}`;
    case "slipped":
      return `empeoró · vuelve ${inDays(change.nextInDays)}`;
    case "mastered":
      return change.counted ? "¡dominada!" : "ya dominada";
    default:
      // Practiced before its date: noted, the date stays
      return `práctica extra · el repaso sigue ${inDays(change.nextInDays)}`;
  }
};
</script>
