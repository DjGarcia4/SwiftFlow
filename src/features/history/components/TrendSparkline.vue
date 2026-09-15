<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    class="w-full h-auto"
    preserveAspectRatio="none"
  >
    <path :d="areaPath" fill="var(--color-primary)" fill-opacity="0.1" />
    <path
      :d="linePath"
      fill="none"
      stroke="var(--color-primary)"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // wpm values in chronological order (oldest first)
  values: {
    type: Array,
    default: () => [],
  },
});

const width = 300;
const height = 60;
const padding = 4;

const maxValue = computed(() => Math.max(1, ...props.values));

const xScale = (index) =>
  props.values.length <= 1
    ? width / 2
    : padding + (index / (props.values.length - 1)) * (width - padding * 2);

const yScale = (value) =>
  height - padding - (value / maxValue.value) * (height - padding * 2);

const linePath = computed(() => {
  if (!props.values.length) return "";
  return props.values
    .map((value, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(value)}`)
    .join(" ");
});

const areaPath = computed(() => {
  if (!props.values.length) return "";
  const baseline = height - padding;
  return `${linePath.value} L ${xScale(props.values.length - 1)} ${baseline} L ${xScale(0)} ${baseline} Z`;
});
</script>
