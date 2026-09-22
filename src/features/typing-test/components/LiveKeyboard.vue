<template>
  <!--
    The keyboard while typing: the next key lit up (with Shift or the accent
    key when it needs them), keys tinting red as this session misses them,
    and a mistake flashing both the key that was wanted and the one hit.
  -->
  <KeyboardLayout with-modifiers :key-class="keyClass" :key-style="keyStyle" />
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import KeyboardLayout from "./KeyboardLayout.vue";
import { useConfigStore } from "@/features/typing-test/store";
import {
  keyboardTarget,
  foldByKey,
  ACCENT_KEY,
  SHIFT_KEY,
} from "@/features/typing-test/utils/keyboardMap";

// A key needs a couple of misses before it's worth coloring
const MIN_TINT_MISSES = 2;
const FLASH_MS = 450;

const configStore = useConfigStore();

const next = computed(() =>
  keyboardTarget(configStore.referenceText[configStore.userInput.length])
);

// This session's miss rate per key, as a share of the worst one's
const missTint = computed(() => {
  const misses = foldByKey(configStore.missedKeys);
  const attempts = foldByKey(configStore.keyAttempts);
  const rates = {};
  for (const [key, missed] of Object.entries(misses)) {
    if (missed >= MIN_TINT_MISSES) rates[key] = missed / (attempts[key] || missed);
  }
  const worst = Math.max(0, ...Object.values(rates));
  return Object.fromEntries(
    Object.entries(rates).map(([key, rate]) => [key, rate / worst])
  );
});

// The last mistake: the key it should have been and the one pressed
const flash = ref(null);
let flashTimeout = null;

watch(
  () => configStore.userInput,
  (input, previous) => {
    if (input.length !== (previous?.length ?? 0) + 1) return;
    const index = input.length - 1;
    const expected = configStore.referenceText[index];
    if (input[index] === expected) return;

    flash.value = {
      wanted: keyboardTarget(expected)?.key ?? null,
      pressed: keyboardTarget(input[index])?.key ?? null,
    };
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
      flash.value = null;
    }, FLASH_MS);
  }
);

onUnmounted(() => clearTimeout(flashTimeout));

const isNext = (key) =>
  Boolean(next.value) &&
  (key === next.value.key ||
    (key === SHIFT_KEY && next.value.shift) ||
    (key === ACCENT_KEY && next.value.accent));

const keyClass = (key) => {
  const base =
    "transition-[background-color,border-color,color,scale,box-shadow] duration-150";
  if (flash.value?.wanted === key) {
    return `${base} border-danger bg-danger text-white scale-110 shadow-md shadow-danger/40`;
  }
  if (flash.value?.pressed === key) {
    return `${base} border-charcoal/60 bg-faded-gray/60 text-charcoal`;
  }
  if (isNext(key)) {
    // The key itself solid, the ones held with it just outlined
    return key === next.value.key
      ? `${base} border-primary-dark bg-primary text-white scale-105 shadow-md shadow-primary/40`
      : `${base} border-primary bg-primary-tint text-primary`;
  }
  return `${base} border-faded-gray text-pencil-gray`;
};

const keyStyle = (key) => {
  const tint = missTint.value[key];
  if (!tint || isNext(key) || flash.value?.wanted === key) return {};
  // 12%..45% of the danger color: a hint, never louder than the next key
  const strength = Math.round(12 + tint * 33);
  return {
    backgroundColor: `color-mix(in srgb, var(--color-danger) ${strength}%, transparent)`,
    borderColor: `color-mix(in srgb, var(--color-danger) ${strength + 15}%, transparent)`,
  };
};
</script>
