<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold uppercase tracking-wide text-pencil-gray"
        >WPM por segundo</span
      >
      <span
        v-if="errorMarkers.length"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-pencil-gray"
      >
        <span class="inline-block w-2 h-2 rounded-full bg-danger"></span>
        error
      </span>
    </div>

    <svg
      ref="svgRef"
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full h-auto select-none touch-none"
      @mousemove="handleMove"
      @mouseleave="hoverIndex = null"
    >
      <!-- Gridlines + y-axis labels (recessive) -->
      <g>
        <template v-for="tick in yTicks" :key="tick.value">
          <line
            :x1="padding.left"
            :x2="width - padding.right"
            :y1="yScale(tick.value)"
            :y2="yScale(tick.value)"
            stroke="var(--color-faded-gray)"
            stroke-width="1"
          />
          <text
            :x="padding.left - 8"
            :y="yScale(tick.value)"
            text-anchor="end"
            dominant-baseline="middle"
            class="fill-pencil-gray"
            font-size="10"
          >
            {{ tick.value }}
          </text>
        </template>
      </g>

      <!-- X-axis time labels -->
      <g>
        <text
          v-for="tick in xTicks"
          :key="tick.time"
          :x="xScale(tick.time)"
          :y="height - padding.bottom + 16"
          text-anchor="middle"
          class="fill-pencil-gray"
          font-size="10"
        >
          {{ tick.time }}s
        </text>
      </g>

      <!-- Area fill under the line -->
      <path
        :d="areaPath"
        fill="var(--color-success)"
        fill-opacity="0.1"
        class="animate-fade-in [animation-delay:500ms] [animation-duration:900ms]"
      />

      <!-- WPM line: draws itself left to right (pathLength normalizes the
           dash math to 0..1 whatever the real length is) -->
      <path
        :d="linePath"
        pathLength="1"
        stroke-dasharray="1"
        class="animate-draw [animation-delay:250ms]"
        fill="none"
        stroke="var(--color-success)"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- Error markers: surface ring + danger dot -->
      <g
        v-for="(marker, i) in errorMarkers"
        :key="i"
        class="animate-pop-in"
        :style="{
          transformOrigin: `${marker.x}px ${marker.y}px`,
          transformBox: 'view-box',
          animationDelay: `${250 + marker.progress * 1100}ms`,
        }"
      >
        <circle :cx="marker.x" :cy="marker.y" r="6" fill="var(--color-paper-white)" />
        <circle :cx="marker.x" :cy="marker.y" r="4" fill="var(--color-danger)" />
      </g>

      <!-- Final value label — anchored to end and pulled left so it never
           overflows the right edge (the last point always sits there). -->
      <text
        v-if="points.length"
        :x="xScale(lastPoint.time) - 6"
        :y="Math.max(yScale(lastPoint.wpm) - 8, padding.top + 10)"
        text-anchor="end"
        class="fill-charcoal animate-fade-in [animation-delay:1200ms]"
        font-size="12"
        font-weight="800"
      >
        {{ lastPoint.wpm }}
      </text>

      <!-- Hover crosshair + tooltip -->
      <g v-if="hoverPoint">
        <line
          :x1="xScale(hoverPoint.time)"
          :x2="xScale(hoverPoint.time)"
          :y1="padding.top"
          :y2="height - padding.bottom"
          stroke="var(--color-faded-gray)"
          stroke-width="1"
        />
        <circle
          :cx="xScale(hoverPoint.time)"
          :cy="yScale(hoverPoint.wpm)"
          r="4"
          fill="var(--color-success)"
          stroke="var(--color-paper-white)"
          stroke-width="2"
        />
        <g :transform="`translate(${tooltipX}, ${padding.top + 4})`">
          <rect width="86" height="34" rx="8" fill="var(--color-night-ink)" />
          <text x="8" y="14" font-size="11" font-weight="800" fill="white">
            {{ hoverPoint.wpm }} wpm
          </text>
          <text x="8" y="27" font-size="10" fill="var(--color-faded-gray)">
            seg {{ hoverPoint.time }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  history: {
    type: Array,
    default: () => [],
  },
});

const width = 600;
const height = 200;
const padding = { top: 12, right: 8, bottom: 24, left: 32 };

const svgRef = ref(null);
const hoverIndex = ref(null);

// Always start the line at (0, 0) so the trend reads from the beginning,
// even if the first recorded sample landed a second or two in.
const points = computed(() => {
  if (!props.history.length) return [];
  if (props.history[0].time === 0) return props.history;
  return [{ time: 0, wpm: 0, errors: 0 }, ...props.history];
});

const lastPoint = computed(() => points.value[points.value.length - 1]);

const maxTime = computed(() =>
  Math.max(1, points.value[points.value.length - 1]?.time ?? 1)
);

const maxWpm = computed(() => {
  const highest = Math.max(1, ...points.value.map((p) => p.wpm));
  return Math.ceil((highest * 1.15) / 10) * 10;
});

const xScale = (time) =>
  padding.left + (time / maxTime.value) * (width - padding.left - padding.right);

const yScale = (wpm) =>
  height -
  padding.bottom -
  (wpm / maxWpm.value) * (height - padding.top - padding.bottom);

const yTicks = computed(() => {
  const steps = 4;
  return Array.from({ length: steps + 1 }, (_, i) => ({
    value: Math.round((maxWpm.value / steps) * i),
  }));
});

const xTicks = computed(() => {
  const steps = Math.min(6, maxTime.value);
  return Array.from({ length: steps + 1 }, (_, i) => ({
    time: Math.round((maxTime.value / steps) * i),
  }));
});

const linePath = computed(() => {
  if (!points.value.length) return "";
  return points.value
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.time)} ${yScale(p.wpm)}`)
    .join(" ");
});

const areaPath = computed(() => {
  if (!points.value.length) return "";
  const baseline = height - padding.bottom;
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L ${xScale(last.time)} ${baseline} L ${xScale(first.time)} ${baseline} Z`;
});

// A marker for every second the error count went up from the previous one.
const errorMarkers = computed(() => {
  const markers = [];
  for (let i = 1; i < points.value.length; i++) {
    if (points.value[i].errors > points.value[i - 1].errors) {
      markers.push({
        x: xScale(points.value[i].time),
        y: yScale(points.value[i].wpm),
        // How far along the line this is, so it pops as the line reaches it
        progress: points.value[i].time / maxTime.value,
      });
    }
  }
  return markers;
});

const hoverPoint = computed(() =>
  hoverIndex.value === null ? null : points.value[hoverIndex.value]
);

const tooltipX = computed(() => {
  if (hoverPoint.value === null) return 0;
  const x = xScale(hoverPoint.value.time) + 10;
  return Math.min(x, width - 94);
});

const handleMove = (event) => {
  if (!svgRef.value || !points.value.length) return;

  const rect = svgRef.value.getBoundingClientRect();
  const relativeX = ((event.clientX - rect.left) / rect.width) * width;
  const time =
    ((relativeX - padding.left) / (width - padding.left - padding.right)) * maxTime.value;

  let closestIndex = 0;
  let closestDistance = Infinity;
  points.value.forEach((p, i) => {
    const distance = Math.abs(p.time - time);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  });

  hoverIndex.value = closestIndex;
};
</script>
