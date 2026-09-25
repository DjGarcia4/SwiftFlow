<template>
  <!--
    The keyboard being typed on, drawn. It only lays the keys out: what each one looks
    like comes from keyClass/keyStyle, so the history's error heatmap and the
    live keyboard while typing share one drawing.
  -->
  <div class="flex flex-col items-center" :class="compact ? 'gap-1' : 'gap-1.5'">
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      class="flex"
      :class="compact ? 'gap-1' : 'gap-1.5'"
      :style="{ paddingLeft: `${rowIndent(rowIndex)}rem` }"
    >
      <div
        v-for="(key, keyIndex) in row"
        :key="`${rowIndex}-${keyIndex}`"
        :data-key="key"
        :class="[KEY_BASE, sizeClass, widthClass(key), keyClass(key)]"
        :style="keyStyle(key, rowIndex, keyIndex)"
      >
        {{ labelOf(key) }}
        <slot name="tooltip" :char="key" />
      </div>
    </div>
    <div class="flex" :class="compact ? 'gap-1' : 'gap-1.5'">
      <div
        :class="[
          KEY_BASE,
          sizeClass,
          compact ? 'w-52' : 'w-64',
          'font-sans normal-case text-xs',
          keyClass(' '),
        ]"
        :style="keyStyle(' ', rows.length, 4)"
      >
        espacio
        <slot name="tooltip" :char="' '" />
      </div>
      <div
        v-if="withModifiers && hasAltGr"
        :data-key="ALTGR_KEY"
        :class="[
          KEY_BASE,
          sizeClass,
          compact ? 'w-12' : 'w-14',
          'font-sans normal-case text-xs',
          keyClass(ALTGR_KEY),
        ]"
        :style="keyStyle(ALTGR_KEY, rows.length, 5)"
      >
        AltGr
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { SHIFT_KEY, ALTGR_KEY } from "@/features/typing-test/utils/keyboardMap";
import { layoutById } from "@/features/typing-test/utils/keyboardLayouts";
import { useConfigStore } from "@/features/typing-test/store";

const props = defineProps({
  // (char) => class for that key
  keyClass: { type: Function, default: () => "" },
  // (char, rowIndex, keyIndex) => inline style for that key
  keyStyle: { type: Function, default: () => ({}) },
  // Draws the Shift keys, and AltGr on keyboards that use it
  withModifiers: { type: Boolean, default: false },
  // Smaller keys, for sitting under the text without competing with it
  compact: { type: Boolean, default: false },
  // A layout id; the one picked in the settings when left out
  layout: { type: String, default: null },
});

const configStore = useConfigStore();
const layout = computed(() => layoutById(props.layout ?? configStore.keyboardLayout));
const hasAltGr = computed(() => Object.keys(layout.value.altgr).length > 0);

const KEY_BASE =
  "group relative flex items-center justify-center rounded-lg border-2 font-mono font-bold uppercase";
const sizeClass = computed(() => (props.compact ? "h-8 text-xs" : "h-9 text-sm"));

const rows = computed(() => {
  const keys = layout.value.rows.map((row) => row.keys);
  if (!props.withModifiers) return keys;
  return keys.map((row, index) =>
    index === keys.length - 1 ? [SHIFT_KEY, ...row, SHIFT_KEY] : row
  );
});

// The staggered look of a real keyboard: each row a little further right,
// less a key's width when a row starts left of the Z column (the < on ISO
// keyboards). With the Shift keys drawn, the left one fills the bottom
// row's indent instead.
const rowIndent = (rowIndex) => {
  if (props.withModifiers && rowIndex === rows.value.length - 1) return 0;
  const step = props.compact ? 0.6 : 0.75;
  const keyWidth = props.compact ? 2.25 : 2.625;
  return Math.max(0, rowIndex * step + layout.value.rows[rowIndex].start * keyWidth);
};

const widthClass = (key) => {
  if (key === SHIFT_KEY)
    return props.compact ? "w-12 font-sans" : "w-14 font-sans text-xs";
  return props.compact ? "w-8" : "w-9";
};

const labelOf = (key) => (key === SHIFT_KEY ? "⇧" : key);
</script>
