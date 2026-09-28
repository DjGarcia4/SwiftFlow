<template>
  <!--
    Your speed over your last runs, readable at a glance: a sentence saying
    where it's going, each run as a faint dot (they jump around), and the
    running average as the line to read -- with the wpm up the side, the
    dates along the bottom, the record marked, and each run on hover.
  -->
  <div ref="rootRef" class="w-full">
    <div class="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="text-xs font-bold uppercase tracking-wide text-pencil-gray">{{
        t("history.view.wpmTrend")
      }}</span>
      <span
        class="inline-flex items-center gap-3 text-[11px] font-bold text-pencil-gray"
        aria-hidden="true"
      >
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full bg-primary/40"></span>
          {{ t("history.trendChart.each") }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-1 w-4 rounded-full bg-primary"></span>
          {{ t("history.trendChart.average", TREND_WINDOW) }}
        </span>
      </span>
    </div>

    <!-- The verdict, in words -->
    <p class="mb-3 text-sm font-bold text-charcoal">
      <component
        :is="verdictIcon"
        v-if="summary"
        class="mr-1 inline h-4 w-4 align-[-2px]"
        :class="verdictColor"
        aria-hidden="true"
      />
      {{ verdict }}
    </p>

    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full h-auto select-none touch-none"
      role="img"
      :aria-label="verdict"
      @mousemove="handleMove"
      @mouseleave="hoverIndex = null"
    >
      <!-- Gridlines and the wpm up the side -->
      <g>
        <template v-for="tick in yTicks" :key="tick">
          <line
            :x1="padding.left"
            :x2="width - padding.right"
            :y1="yScale(tick)"
            :y2="yScale(tick)"
            stroke="var(--color-faded-gray)"
            stroke-width="1"
            :stroke-opacity="tick === yMin ? 1 : 0.5"
          />
          <text
            :x="padding.left - 8"
            :y="yScale(tick)"
            text-anchor="end"
            dominant-baseline="middle"
            class="fill-pencil-gray"
            font-size="11"
          >
            {{ tick }}
          </text>
        </template>
      </g>

      <!-- The dates along the bottom -->
      <text
        v-for="(tick, index) in xTicks"
        :key="tick.index"
        :x="xScale(tick.index)"
        :y="height - 6"
        :text-anchor="
          index === 0 ? 'start' : index === xTicks.length - 1 ? 'end' : 'middle'
        "
        class="fill-pencil-gray"
        font-size="11"
      >
        {{ tick.label }}
      </text>

      <!-- Each run: faint, since one run alone says little -->
      <path
        :d="rawPath"
        fill="none"
        stroke="var(--color-primary)"
        stroke-opacity="0.25"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle
        v-for="(point, index) in points"
        :key="index"
        :cx="xScale(index)"
        :cy="yScale(point.wpm)"
        r="3"
        fill="var(--color-primary)"
        fill-opacity="0.4"
      />

      <!-- The running average: the line to read -->
      <path
        :d="averageArea"
        fill="var(--color-primary)"
        fill-opacity="0.08"
        class="animate-fade-in [animation-delay:400ms]"
      />
      <path
        :d="averagePath"
        pathLength="1"
        stroke-dasharray="1"
        class="animate-draw [animation-delay:150ms]"
        fill="none"
        stroke="var(--color-primary)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- The record -->
      <g v-if="best >= 0">
        <circle
          :cx="xScale(best)"
          :cy="yScale(points[best].wpm)"
          r="5"
          fill="var(--color-success)"
          stroke="var(--color-paper-white)"
          stroke-width="2"
        />
        <text
          :x="clampLabelX(xScale(best))"
          :y="yScale(points[best].wpm) - 10"
          text-anchor="middle"
          class="fill-success-dark"
          font-size="11"
          font-weight="800"
        >
          {{ t("history.trendChart.best", points[best].wpm) }}
        </text>
      </g>

      <!-- One run, on hover -->
      <g v-if="hoverPoint">
        <line
          :x1="xScale(hoverIndex)"
          :x2="xScale(hoverIndex)"
          :y1="padding.top"
          :y2="height - padding.bottom"
          stroke="var(--color-faded-gray)"
          stroke-width="1"
        />
        <circle
          :cx="xScale(hoverIndex)"
          :cy="yScale(hoverPoint.wpm)"
          r="5"
          fill="var(--color-primary)"
          stroke="var(--color-paper-white)"
          stroke-width="2"
        />
        <g :transform="`translate(${tooltipX}, ${padding.top})`">
          <rect :width="TOOLTIP_WIDTH" height="56" rx="8" fill="var(--color-night-ink)" />
          <text x="10" y="18" font-size="13" font-weight="800" fill="white">
            {{ hoverPoint.wpm }} wpm
            <tspan font-size="11" font-weight="600" fill="var(--color-faded-gray)">
              · {{ t("history.trendChart.accuracy", hoverPoint.accuracy) }}
            </tspan>
          </text>
          <text x="10" y="33" font-size="11" fill="var(--color-faded-gray)">
            {{ hoverPoint.label }}
          </text>
          <text x="10" y="47" font-size="11" fill="var(--color-faded-gray)">
            {{ formatDay(hoverPoint.date, true) }}
          </text>
        </g>
      </g>
    </svg>

    <p v-if="mixedModes" class="mt-2 text-[11px] font-bold text-pencil-gray">
      {{ t("history.trendChart.mixed") }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import { t, localeTag } from "@/shared/i18n";
import {
  TREND_WINDOW,
  movingAverage,
  summarizeTrend,
  bestIndex,
} from "@/features/history/utils/wpmTrend";

const props = defineProps({
  // The runs, oldest first: { wpm, accuracy, date, label, mode }
  points: { type: Array, default: () => [] },
});

// One unit to a pixel, like the results chart: same height and text size
// at any width
const FALLBACK_WIDTH = 600;
const MIN_WIDTH = 280;
const height = 200;
const padding = { top: 22, right: 12, bottom: 26, left: 34 };
const TOOLTIP_WIDTH = 170;

const rootRef = ref(null);
const width = ref(FALLBACK_WIDTH);
let resizeObserver = null;
const measure = () => {
  const measured = rootRef.value?.clientWidth;
  if (measured) width.value = Math.max(MIN_WIDTH, Math.round(measured));
};
onMounted(() => {
  measure();
  if (typeof ResizeObserver !== "undefined" && rootRef.value) {
    resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rootRef.value);
  }
});
onUnmounted(() => resizeObserver?.disconnect());

const values = computed(() => props.points.map((point) => point.wpm));
const average = computed(() => movingAverage(values.value));
const summary = computed(() => summarizeTrend(values.value));
const best = computed(() => bestIndex(values.value));

// A 15-second run and a code snippet aren't the same exercise
const mixedModes = computed(
  () => new Set(props.points.map((point) => point.mode)).size > 1
);

const verdict = computed(() => {
  const s = summary.value;
  if (!s) return t("history.trendChart.few");
  return t(`history.trendChart.${s.direction}`, s.recent, Math.abs(s.change), s.count);
});
const verdictIcon = computed(
  () =>
    ({
      up: ArrowTrendingUpIcon,
      down: ArrowTrendingDownIcon,
      steady: ArrowRightIcon,
    })[summary.value?.direction]
);
const verdictColor = computed(
  () =>
    ({
      up: "text-success",
      down: "text-danger",
      steady: "text-pencil-gray",
    })[summary.value?.direction]
);

// The scale hugs the runs (with room above for the record's label) instead
// of starting at 0, so a change of a few wpm is visible at all
const yMin = computed(() =>
  Math.max(0, Math.floor((Math.min(...values.value) - 5) / 10) * 10)
);
const yMax = computed(() => {
  const top = Math.ceil((Math.max(...values.value) + 5) / 10) * 10;
  return Math.max(top, yMin.value + 10);
});
const yTicks = computed(() => {
  const span = yMax.value - yMin.value;
  const step = span <= 40 ? 10 : span <= 80 ? 20 : 40;
  const ticks = [];
  for (let value = yMin.value; value <= yMax.value; value += step) ticks.push(value);
  return ticks;
});

const xScale = (index) =>
  props.points.length <= 1
    ? width.value / 2
    : padding.left +
      (index / (props.points.length - 1)) * (width.value - padding.left - padding.right);
const yScale = (wpm) =>
  height -
  padding.bottom -
  ((wpm - yMin.value) / (yMax.value - yMin.value)) *
    (height - padding.top - padding.bottom);

const pathOf = (series) =>
  series
    .map((value, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(value)}`)
    .join(" ");
const rawPath = computed(() => pathOf(values.value));
const averagePath = computed(() => pathOf(average.value));
const averageArea = computed(() => {
  if (!average.value.length) return "";
  const baseline = height - padding.bottom;
  return `${averagePath.value} L ${xScale(average.value.length - 1)} ${baseline} L ${xScale(0)} ${baseline} Z`;
});

const formatDay = (iso, withTime = false) =>
  new Date(iso).toLocaleString(localeTag(), {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });

// First, middle and last run's day -- the spacing is by run, not by date
const xTicks = computed(() => {
  const count = props.points.length;
  if (!count) return [];
  const indexes =
    count > 2 ? [0, Math.floor((count - 1) / 2), count - 1] : [0, count - 1];
  return [...new Set(indexes)].map((index) => ({
    index,
    label: formatDay(props.points[index].date),
  }));
});

const clampLabelX = (x) =>
  Math.min(Math.max(x, padding.left + 30), width.value - padding.right - 30);

const hoverIndex = ref(null);
const hoverPoint = computed(() =>
  hoverIndex.value === null ? null : props.points[hoverIndex.value]
);
const tooltipX = computed(() => {
  const x = xScale(hoverIndex.value ?? 0);
  return x + 12 + TOOLTIP_WIDTH > width.value ? x - 12 - TOOLTIP_WIDTH : x + 12;
});

const handleMove = (event) => {
  const count = props.points.length;
  if (!count) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;
  const span = width.value - padding.left - padding.right;
  const index = Math.round(((x - padding.left) / span) * (count - 1));
  hoverIndex.value = Math.min(count - 1, Math.max(0, index));
};
</script>
