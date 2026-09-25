<template>
  <!--
    How the keys are going: the ones that got clearly better, and the ones
    that got worse, over the latest sessions against the ones before.
  -->
  <div>
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.trends.title") }}
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{ t("history.trends.scope", trends.sessions) }}
      </div>
    </div>

    <p
      v-if="!trends.improved.length && !trends.worsened.length"
      class="text-sm text-pencil-gray"
    >
      {{ t("history.trends.nothing") }}
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div v-for="column in columns" :key="column.title">
        <div
          class="mb-2 flex items-center gap-1.5 text-sm font-extrabold"
          :class="column.tone"
        >
          <component :is="column.icon" class="h-4 w-4" />
          {{ column.title }}
        </div>
        <ul v-if="column.items.length" class="space-y-1.5">
          <li
            v-for="trend in column.items"
            :key="trend.key"
            class="flex items-center gap-3"
          >
            <kbd
              class="min-w-[4.5rem] rounded-md border-2 border-faded-gray px-2 py-0.5 text-center font-mono text-sm font-extrabold text-charcoal"
              >{{ formatKeyLabel(trend.key) }}</kbd
            >
            <span class="text-sm font-bold tabular-nums text-pencil-gray">
              {{ percent(trend.before) }}
              <span aria-hidden="true">&nbsp;→&nbsp;</span>
              <span class="sr-only">{{ t("history.trends.to") }}</span>
              <span class="font-extrabold" :class="column.tone">{{
                percent(trend.after)
              }}</span>
              {{ t("history.trends.ofError") }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-pencil-gray">{{ column.empty }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/vue/24/outline";
import { formatKeyLabel } from "@/features/history/utils/historyStats";

const props = defineProps({
  // Output of computeKeyTrends (not null)
  trends: { type: Object, required: true },
});

const percent = (rate) => `${Math.round(rate * 100)}%`;

const columns = computed(() => [
  {
    title: t("history.trends.improved"),
    icon: ArrowTrendingDownIcon,
    tone: "text-success",
    items: props.trends.improved,
    empty: t("history.trends.noneImproved"),
  },
  {
    title: t("history.trends.worsened"),
    icon: ArrowTrendingUpIcon,
    tone: "text-danger",
    items: props.trends.worsened,
    empty: t("history.trends.noneWorsened"),
  },
]);
</script>
