<template>
  <span class="tabular-nums">{{ display }}</span>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { prefersReducedMotion } from "@/shared/utils/motion";

// Counts up to `value` when it first appears, and tweens between values
// when it changes afterwards — used for stats that deserve a little reveal.
const props = defineProps({
  value: { type: Number, required: true },
  duration: { type: Number, default: 900 },
  decimals: { type: Number, default: 0 },
  // Optional custom formatting (e.g. thousands separators)
  format: { type: Function, default: null },
});

const current = ref(0);
let frame = null;

const animateTo = (target) => {
  cancelAnimationFrame(frame);
  const from = current.value;

  if (prefersReducedMotion() || from === target || !props.duration) {
    current.value = target;
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / props.duration);
    const eased = 1 - Math.pow(1 - t, 4);
    current.value = from + (target - from) * eased;
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
};

onMounted(() => animateTo(props.value));
watch(() => props.value, animateTo);
onUnmounted(() => cancelAnimationFrame(frame));

const display = computed(() => {
  const factor = 10 ** props.decimals;
  const rounded = Math.round(current.value * factor) / factor;
  if (props.format) return props.format(rounded);
  return rounded.toFixed(props.decimals);
});
</script>
