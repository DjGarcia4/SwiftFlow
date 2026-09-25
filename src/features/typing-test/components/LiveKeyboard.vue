<template>
  <!--
    The keyboard while typing: the next key lit up (with Shift, AltGr or the
    accent's dead key when it needs them), keys tinting red as this session misses them,
    and a mistake flashing both the key that was wanted and the one hit.
  -->
  <div class="flex-col items-center gap-3">
    <KeyboardLayout with-modifiers compact :key-class="keyClass" :key-style="keyStyle" />

    <!-- Above the invisible textarea that covers the typing area, or the
         toggle couldn't be clicked -->
    <div class="relative z-10 flex items-center gap-3 text-xs font-bold text-pencil-gray">
      <!-- Which finger the next key is for -->
      <span
        v-if="configStore.fingerColors && nextFinger"
        class="inline-flex items-center gap-1.5"
      >
        <span
          class="inline-block h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: fingerColor(nextFinger) }"
        ></span>
        Próxima: {{ FINGERS[nextFinger].name }}
      </span>
      <KeyboardLayoutPicker @picked="refocusText" />
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 transition-colors duration-200"
        :class="
          configStore.fingerColors
            ? 'text-primary'
            : 'text-pencil-gray/70 hover:text-charcoal'
        "
        :aria-pressed="configStore.fingerColors"
        @click="toggleFingerColors"
      >
        <HandRaisedIcon class="w-3.5 h-3.5" />
        Colores por dedo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from "vue";
import { HandRaisedIcon } from "@heroicons/vue/24/outline";
import KeyboardLayout from "./KeyboardLayout.vue";
import KeyboardLayoutPicker from "./KeyboardLayoutPicker.vue";
import { useConfigStore } from "@/features/typing-test/store";
import {
  keyboardTarget,
  foldByKey,
  SHIFT_KEY,
  ALTGR_KEY,
  FINGERS,
  fingerOfKey,
} from "@/features/typing-test/utils/keyboardMap";
import { layoutById } from "@/features/typing-test/utils/keyboardLayouts";

// A key needs a couple of misses before it's worth coloring
const MIN_TINT_MISSES = 2;
const FLASH_MS = 450;

const configStore = useConfigStore();
const layout = computed(() => layoutById(configStore.keyboardLayout));

// One color per kind of finger, the same on both hands
const FINGER_RGB = {
  pinky: [139, 92, 246], // violet
  ring: [59, 130, 246], // blue
  middle: [16, 185, 129], // emerald
  index: [245, 158, 11], // amber
  thumb: [100, 116, 139], // slate
};
const rgbOf = (finger) => FINGER_RGB[FINGERS[finger].kind];
const fingerColor = (finger) => `rgb(${rgbOf(finger).join(" ")})`;

// Shift belongs to whichever pinky isn't pressing the key; drawn as a pinky
const fingerFor = (key) =>
  key === SHIFT_KEY ? "left-pinky" : fingerOfKey(key, layout.value);

const nextFinger = computed(() =>
  next.value ? fingerOfKey(next.value.key, layout.value) : null
);

// The controls keep the focus after a click; hand it back to the text
const refocusText = () => nextTick(() => document.querySelector("textarea")?.focus());
const toggleFingerColors = () => {
  configStore.toggleFingerColors();
  refocusText();
};

const next = computed(() =>
  keyboardTarget(configStore.referenceText[configStore.userInput.length], layout.value)
);

// This session's miss rate per key, as a share of the worst one's
const missTint = computed(() => {
  // Sin red: no key gives away that it's being missed
  if (configStore.blindMode) return {};
  const misses = foldByKey(configStore.missedKeys, layout.value);
  const attempts = foldByKey(configStore.keyAttempts, layout.value);
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
    if (input[index] === expected || configStore.blindMode) return;

    flash.value = {
      wanted: keyboardTarget(expected, layout.value)?.key ?? null,
      pressed: keyboardTarget(input[index], layout.value)?.key ?? null,
    };
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
      flash.value = null;
    }, FLASH_MS);
  }
);

onUnmounted(() => clearTimeout(flashTimeout));

// The key itself, and whatever goes with it: Shift or AltGr held for it or
// for its dead key, and the dead key pressed first
const isNext = (key) => {
  const target = next.value;
  if (!target) return false;
  if (key === target.key || key === target.dead?.key) return true;
  if (key === SHIFT_KEY) return target.shift || Boolean(target.dead?.shift);
  if (key === ALTGR_KEY) return target.altgr;
  return false;
};

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
  // Finger colors come in through keyStyle
  if (configStore.fingerColors) return base;
  // At rest the keys stay in the background; the text is what's being read
  return `${base} border-faded-gray/50 text-pencil-gray/60`;
};

const fingerStyle = (key) => {
  const finger = fingerFor(key);
  if (!finger) return {};
  const [r, g, b] = rgbOf(finger);
  // The key itself: solid in its finger's color, so the color is the cue
  if (next.value && key === next.value.key) {
    return {
      backgroundColor: `rgb(${r} ${g} ${b})`,
      borderColor: `rgb(${Math.round(r * 0.75)} ${Math.round(g * 0.75)} ${Math.round(b * 0.75)})`,
      color: "white",
      boxShadow: `0 4px 10px -2px rgba(${r}, ${g}, ${b}, 0.5)`,
    };
  }
  // Held with it (Shift, AltGr, the accent): outlined. At rest: a faint wash.
  const held = isNext(key);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${held ? 0.2 : 0.1})`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${held ? 0.9 : 0.35})`,
    color: `rgb(${r} ${g} ${b})`,
  };
};

const keyStyle = (key) => {
  // A mistake's flash is drawn by the classes, and wins over everything
  if (flash.value?.wanted === key || flash.value?.pressed === key) return {};
  const tint = missTint.value[key];
  if (!tint || isNext(key)) return configStore.fingerColors ? fingerStyle(key) : {};
  // 12%..45% of the danger color: a hint, never louder than the next key
  const strength = Math.round(12 + tint * 33);
  return {
    backgroundColor: `color-mix(in srgb, var(--color-danger) ${strength}%, transparent)`,
    borderColor: `color-mix(in srgb, var(--color-danger) ${strength + 15}%, transparent)`,
  };
};
</script>
