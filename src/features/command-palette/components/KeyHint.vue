<template>
  <!-- The key that presses the button it sits beside. Only where there's a
       keyboard to press it on, and only while the key does something. -->
  <kbd
    v-if="combo"
    aria-hidden="true"
    data-key-hint
    class="hidden pointer-fine:inline-flex items-center justify-center rounded-md border-2 font-mono font-bold leading-none whitespace-nowrap"
    :class="[
      tone === 'onPrimary'
        ? 'border-white/40 bg-white/15 text-white'
        : 'border-faded-gray bg-paper-white text-pencil-gray',
      corner
        ? 'absolute -bottom-2 -right-2 z-10 pointer-events-none min-w-[1.15rem] px-1 py-px text-[10px] shadow-sm'
        : small
          ? 'min-w-[1.25rem] px-1 py-0.5 text-[10px]'
          : 'min-w-[1.5rem] px-1.5 py-1 text-[11px]',
    ]"
    >{{ combo }}</kbd
  >
</template>

<script setup>
import { computed } from "vue";
import { useHotkeysStore } from "@/features/command-palette/hotkeys";

const props = defineProps({
  // The hotkey's id, as registered with useHotkey
  id: { type: String, required: true },
  // On a filled (primary) button the chip goes light
  tone: { type: String, default: "default" },
  small: { type: Boolean, default: false },
  // A badge on the corner of a small icon button (the nav's)
  corner: { type: Boolean, default: false },
});

const hotkeys = useHotkeysStore();
const combo = computed(() => hotkeys.comboFor(props.id));
</script>
