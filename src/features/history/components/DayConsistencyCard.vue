<template>
  <!--
    How steady you are from day to day: a score, the range your days fall
    in, and each day as a dot against your usual band (average ± one
    standard deviation), on your most-played kind of session.
  -->
  <div>
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.consistency.title") }}
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{ t("history.consistency.scope", data.label) }}
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-x-4 gap-y-1">
      <div class="font-display text-4xl font-black leading-none text-charcoal">
        {{ data.score }}<span class="text-xl text-pencil-gray">/100</span>
      </div>
      <div class="pb-0.5">
        <div class="text-sm font-extrabold text-charcoal">{{ data.level }}</div>
        <div class="text-xs font-bold text-pencil-gray">
          {{
            t(
              "history.consistency.range",
              Math.round(data.min),
              Math.round(data.max),
              Math.round(data.mean)
            )
          }}
        </div>
      </div>
    </div>

    <!-- One dot a day, over the band where your days usually land -->
    <div class="relative mt-4" @mouseleave="hovered = null">
      <svg
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        class="h-28 w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        :aria-label="t('history.consistency.chart', data.days.length)"
      >
        <rect
          :x="0"
          :width="WIDTH"
          :y="y(data.mean + data.sd)"
          :height="Math.max(1, y(data.mean - data.sd) - y(data.mean + data.sd))"
          fill="var(--color-primary)"
          fill-opacity="0.1"
          rx="4"
        />
        <line
          :x1="0"
          :x2="WIDTH"
          :y1="y(data.mean)"
          :y2="y(data.mean)"
          stroke="var(--color-pencil-gray)"
          stroke-opacity="0.5"
          stroke-width="1"
          stroke-dasharray="4 4"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <!-- The dots are HTML so they stay round in a stretched chart, and can
           take the keyboard's focus -->
      <button
        v-for="(day, index) in data.days"
        :key="day.date"
        type="button"
        class="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2"
        :style="{
          left: `${(x(index) / WIDTH) * 100}%`,
          top: `${(y(day.wpm) / HEIGHT) * 100}%`,
        }"
        :aria-label="describe(day)"
        @mouseenter="hovered = index"
        @focus="hovered = index"
        @blur="hovered = null"
      >
        <span
          class="block h-2.5 w-2.5 rounded-full border-2 border-paper-white bg-primary transition-transform duration-150"
          :class="{ 'scale-150': hovered === index }"
        ></span>
      </button>
      <div
        v-if="hovered !== null"
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-faded-gray/60 bg-night-ink px-3 py-1.5 text-xs font-bold text-white"
        :style="{
          left: `${(x(hovered) / WIDTH) * 100}%`,
          top: `calc(${(y(data.days[hovered].wpm) / HEIGHT) * 100}% - 10px)`,
        }"
        aria-hidden="true"
      >
        {{ describe(data.days[hovered]) }}
      </div>
    </div>
    <div class="mt-1 flex justify-between text-[10px] font-bold text-pencil-gray">
      <span>{{ formatDay(data.days[0].date) }}</span>
      <span>{{ formatDay(data.days.at(-1).date) }}</span>
    </div>

    <table class="sr-only">
      <caption>
        {{
          t("history.consistency.tableCaption")
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">{{ t("history.consistency.day") }}</th>
          <th scope="col">WPM</th>
          <th scope="col">{{ t("history.consistency.sessions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in data.days" :key="day.date">
          <td>{{ formatDay(day.date) }}</td>
          <td>{{ Math.round(day.wpm) }}</td>
          <td>{{ day.sessions }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { t, localeTag } from "@/shared/i18n";
import { ref, computed } from "vue";

const props = defineProps({
  // Output of computeDayConsistency (not null)
  data: { type: Object, required: true },
});

const WIDTH = 300;
const HEIGHT = 100;
const PAD_X = 10;
const PAD_Y = 14;

const hovered = ref(null);

// The band and every day fit, with room above and below
const bounds = computed(() => {
  const { min, max, mean, sd } = props.data;
  const low = Math.min(min, mean - sd);
  const high = Math.max(max, mean + sd);
  const span = Math.max(high - low, 4);
  return { low: low - span * 0.1, high: high + span * 0.1 };
});

const x = (index) =>
  props.data.days.length === 1
    ? WIDTH / 2
    : PAD_X + (index / (props.data.days.length - 1)) * (WIDTH - PAD_X * 2);
const y = (wpm) => {
  const { low, high } = bounds.value;
  return PAD_Y + (1 - (wpm - low) / (high - low)) * (HEIGHT - PAD_Y * 2);
};

const formatDay = (date) =>
  new Date(date).toLocaleDateString(localeTag(), { day: "numeric", month: "short" });

const describe = (day) =>
  t(
    "history.consistency.describe",
    formatDay(day.date),
    Math.round(day.wpm),
    day.sessions
  );
</script>
