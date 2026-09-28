<template>
  <!--
    "Dedos": the fingers to practice, drawn as two hands -- each finger in
    its keyboard color, as tall as it is, with the letters it types on your
    keyboard -- and the usual picks one tap away.
  -->
  <div class="flex flex-col items-center gap-3">
    <p class="max-w-72 text-center text-xs font-bold text-pencil-gray">
      {{ t("typing.fingerPicker.hint") }}
    </p>

    <div class="flex items-end gap-3 sm:gap-7">
      <div
        v-for="hand in HANDS"
        :key="hand.id"
        role="group"
        :aria-label="t(`typing.fingerPicker.${hand.id}`)"
        class="flex flex-col items-center gap-1.5"
      >
        <div class="flex items-end gap-1 sm:gap-1.5">
          <button
            v-for="finger in hand.fingers"
            :key="finger"
            type="button"
            class="flex w-8 sm:w-10 flex-col items-center justify-end gap-0.5 rounded-t-full rounded-b-xl border-2 pb-1.5 transition-[background-color,border-color,color,scale] duration-200 ease-spring active:scale-95"
            :class="HEIGHTS[FINGERS[finger].kind]"
            :style="fingerStyle(finger)"
            :aria-pressed="isOn(finger)"
            :aria-label="ariaFor(finger)"
            :title="lastOne(finger) ? t('typing.fingerPicker.keepOne') : undefined"
            @click="toggle(finger)"
          >
            <!-- The key it rests on: press it to pick the finger -->
            <KeyCap v-if="keyboard" class="mb-auto mt-2" :on-primary="isOn(finger)">{{
              homeKey(finger)
            }}</KeyCap>
            <span class="font-mono text-[10px] font-extrabold uppercase leading-tight">
              {{ lettersOf(finger).slice(0, 4).join("") }}
            </span>
            <span
              v-if="lettersOf(finger).length > 4"
              class="font-mono text-[10px] font-extrabold uppercase leading-tight"
            >
              {{ lettersOf(finger).slice(4, 8).join("") }}
            </span>
          </button>
        </div>
        <span class="text-[11px] font-bold text-pencil-gray">
          {{ t(`typing.fingerPicker.${hand.id}`) }}
        </span>
      </div>
    </div>

    <div class="flex max-w-80 flex-wrap justify-center gap-1.5">
      <div v-for="(fingers, id, index) in FINGER_PRESETS" :key="id" class="relative">
        <IconButton
          :variant="preset === id ? 'primary' : 'secondary'"
          :aria-pressed="preset === id"
          size="xs"
          :text="t(`typing.fingerPicker.presets.${id}`)"
          @click="configStore.handleFingers(fingers)"
        />
        <KeyCap v-if="keyboard" class="absolute -bottom-1.5 -right-1.5 z-10">{{
          index + 1
        }}</KeyCap>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { t } from "@/shared/i18n";
import IconButton from "@/shared/components/IconButton.vue";
import KeyCap from "@/features/command-palette/components/KeyCap.vue";
import { useMenuKeys } from "@/features/command-palette/hotkeys";
import { useConfigStore } from "@/features/typing-test/store";
import {
  FINGER_IDS,
  FINGER_PRESETS,
  presetOf,
  fingerKeys,
} from "@/features/typing-test/content/fingers";
import { FINGERS, fingerRgb, layoutRows } from "@/features/typing-test/utils/keyboardMap";

const props = defineProps({
  // Pickable from the keyboard while shown: the desktop popover. The
  // phone's sheet has no keyboard to pick with.
  keyboard: { type: Boolean, default: false },
});

const configStore = useConfigStore();

// Left hand pinky to index, right hand index to pinky: as they sit on the keys
const HANDS = [
  { id: "left", fingers: FINGER_IDS.slice(0, 4) },
  { id: "right", fingers: FINGER_IDS.slice(4) },
];
const HEIGHTS = {
  pinky: "h-14",
  ring: "h-[4.5rem]",
  middle: "h-20",
  index: "h-[4.5rem]",
};

const preset = computed(() => presetOf(configStore.fingers));
const isOn = (finger) => configStore.fingers.includes(finger);
const lastOne = (finger) => isOn(finger) && configStore.fingers.length === 1;

const lettersOf = (finger) => fingerKeys([finger], configStore.keyboardLayout);

const ariaFor = (finger) => {
  const letters = lettersOf(finger);
  return `${FINGERS[finger].name}. ${
    letters.length
      ? t("typing.fingerPicker.letters", letters.join(" "))
      : t("typing.fingerPicker.noLetters")
  }`;
};

// On: solid in the finger's color. Off: just its outline.
const fingerStyle = (finger) => {
  const [r, g, b] = fingerRgb(finger);
  return isOn(finger)
    ? {
        backgroundColor: `rgb(${r} ${g} ${b})`,
        borderColor: `rgb(${Math.round(r * 0.75)} ${Math.round(g * 0.75)} ${Math.round(b * 0.75)})`,
        color: "white",
      }
    : {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
        color: `rgb(${r} ${g} ${b})`,
      };
};

// The last finger on stays on: there's no practice on no fingers
const toggle = (finger) => {
  if (lastOne(finger)) return;
  const current = configStore.fingers;
  configStore.handleFingers(
    isOn(finger) ? current.filter((id) => id !== finger) : [...current, finger]
  );
};

// Each finger by the home-row key it rests on -- A S D F, J K L Ñ on a
// Spanish keyboard -- matched by where the key is, whatever it prints
const HOME_CODES = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL", "Semicolon"];
const HOME_COLUMNS = [0, 1, 2, 3, 6, 7, 8, 9];
const homeKey = (finger) => {
  const column = HOME_COLUMNS[FINGER_IDS.indexOf(finger)];
  return (layoutRows(configStore.keyboardLayout)[2]?.[column] ?? "").toUpperCase();
};

useMenuKeys(
  () => props.keyboard,
  (event) => {
    const finger = FINGER_IDS[HOME_CODES.indexOf(event.code)];
    if (finger) {
      toggle(finger);
      return true;
    }
    const presets = Object.values(FINGER_PRESETS);
    const preset = presets[Number(event.key) - 1];
    if (/^[1-9]$/.test(event.key) && preset) {
      configStore.handleFingers(preset);
      return true;
    }
    return false;
  }
);
</script>
