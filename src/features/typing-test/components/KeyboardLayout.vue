<template>
  <!--
    A drawn Spanish keyboard. It only lays the keys out: what each one looks
    like comes from keyClass/keyStyle, so the history's error heatmap and the
    live keyboard while typing share one drawing.
  -->
  <div class="flex flex-col items-center gap-1.5">
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      class="flex gap-1.5"
      :style="{ paddingLeft: `${rowIndent(rowIndex)}rem` }"
    >
      <div
        v-for="(key, keyIndex) in row"
        :key="`${rowIndex}-${keyIndex}`"
        :class="[KEY_BASE, sizeClass, widthClass(key), keyClass(key)]"
        :style="keyStyle(key, rowIndex, keyIndex)"
      >
        {{ labelOf(key) }}
        <slot name="tooltip" :char="key" />
      </div>
    </div>
    <div
      :class="[KEY_BASE, sizeClass, 'w-64 font-sans normal-case text-xs', keyClass(' ')]"
      :style="keyStyle(' ', rows.length, 4)"
    >
      espacio
      <slot name="tooltip" :char="' '" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  KEYBOARD_ROWS,
  ACCENT_KEY,
  SHIFT_KEY,
} from "@/features/typing-test/utils/keyboardMap";

const props = defineProps({
  // (char) => class for that key
  keyClass: { type: Function, default: () => "" },
  // (char, rowIndex, keyIndex) => inline style for that key
  keyStyle: { type: Function, default: () => ({}) },
  // Draws the Shift keys and the accent key too
  withModifiers: { type: Boolean, default: false },
});

const KEY_BASE =
  "group relative flex items-center justify-center rounded-lg border-2 font-mono text-sm font-bold uppercase";
const sizeClass = "h-9";

const rows = computed(() => {
  if (!props.withModifiers) return KEYBOARD_ROWS;
  return KEYBOARD_ROWS.map((row, index) => {
    if (index === 2) return [...row, ACCENT_KEY];
    if (index === 3) return [SHIFT_KEY, ...row, SHIFT_KEY];
    return row;
  });
});

// The staggered look of a real keyboard. With the Shift keys drawn, the
// left one fills the bottom row's indent instead.
const rowIndent = (rowIndex) =>
  props.withModifiers && rowIndex === 3 ? 0 : rowIndex * 0.75;

const widthClass = (key) => (key === SHIFT_KEY ? "w-14 font-sans text-xs" : "w-9");

const labelOf = (key) => (key === SHIFT_KEY ? "⇧" : key);
</script>
