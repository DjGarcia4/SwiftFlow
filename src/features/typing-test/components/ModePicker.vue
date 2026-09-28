<template>
  <!--
    The mode, on desktop: one button saying which it is, opening every mode
    grouped by what it's for, each with a line on what it does. A dozen
    modes side by side made the bar a wall; this keeps it to what's on.
    `inline`, for the phone's settings sheet: the same groups, laid out in
    place.
  -->
  <div ref="root" :class="inline ? '' : 'relative'">
    <button
      v-if="!inline"
      ref="button"
      type="button"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="t('typing.modeMenu.button', current.label)"
      :aria-keyshortcuts="hotkeys.ariaFor('modeMenu')"
      data-mode-button
      class="relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-xs font-extrabold text-white shadow-sm shadow-primary/30 transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
      @click="toggle"
    >
      <ModeIcon :icon="current.icon" />
      {{ current.label }}
      <ChevronDownIcon
        class="w-3.5 h-3.5 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
      <KeyHint id="modeMenu" corner />
    </button>

    <Transition
      enter-active-class="transition-[opacity,translate] duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="inline || open"
        ref="menu"
        role="radiogroup"
        :aria-label="t('typing.toolbar.mode')"
        :class="
          inline
            ? ''
            : 'absolute left-0 top-full z-40 mt-3 w-[34rem] max-w-[90vw] rounded-card border-2 border-faded-gray bg-paper-white p-3 shadow-xl'
        "
        @keydown="onMenuKeydown"
      >
        <div
          v-for="group in groups"
          :key="group.id"
          class="grid items-start gap-2 py-1.5 [&:not(:first-child)]:border-t-2 [&:not(:first-child)]:border-faded-gray/50"
          :class="inline ? 'grid-cols-1' : 'grid-cols-[5.5rem_1fr]'"
        >
          <div
            class="text-[10px] font-extrabold uppercase tracking-wide text-pencil-gray"
            :class="inline ? 'pt-1' : 'pt-2.5'"
          >
            {{ t(`typing.modeMenu.groups.${group.id}`) }}
          </div>
          <div class="grid gap-1" :class="inline ? 'grid-cols-2' : 'grid-cols-3'">
            <button
              v-for="mode in group.modes"
              :key="mode.id"
              type="button"
              role="radio"
              :aria-checked="configStore.type === mode.id"
              :aria-label="mode.label"
              :aria-keyshortcuts="MODE_KEYS[mode.id]?.toUpperCase()"
              :data-mode="mode.id"
              class="flex flex-col items-start gap-0.5 rounded-xl px-2.5 py-2 text-left transition-[background-color,color] duration-150"
              :class="
                configStore.type === mode.id
                  ? 'bg-primary text-white'
                  : 'text-charcoal hover:bg-primary-tint/60'
              "
              @click="pick(mode.id)"
            >
              <span class="flex w-full items-center gap-1.5 text-xs font-extrabold">
                <ModeIcon :icon="mode.icon" />
                {{ mode.label }}
                <KeyCap
                  v-if="MODE_KEYS[mode.id]"
                  class="ml-auto"
                  :on-primary="configStore.type === mode.id"
                  >{{ MODE_KEYS[mode.id].toUpperCase() }}</KeyCap
                >
              </span>
              <span
                class="text-[10px] font-bold leading-tight"
                :class="
                  configStore.type === mode.id ? 'text-white/80' : 'text-pencil-gray'
                "
                >{{ t(`typing.modeMenu.details.${mode.id}`) }}</span
              >
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, h, nextTick, onMounted, onUnmounted } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import { t } from "@/shared/i18n";
import { useConfigStore } from "@/features/typing-test/store";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";
import KeyCap from "@/features/command-palette/components/KeyCap.vue";
import {
  useHotkey,
  useHotkeysStore,
  useMenuKeys,
} from "@/features/command-palette/hotkeys";

const props = defineProps({
  // [{ value, label, icon }]: the modes on offer right now, from the bar
  options: { type: Array, required: true },
  // Laid out in place, no button: the phone's settings sheet
  inline: { type: Boolean, default: false },
});

const configStore = useConfigStore();

// A component, or a short glyph ("A" for words)
const ModeIcon = (props) =>
  typeof props.icon === "string"
    ? h(
        "span",
        { class: "flex w-4 h-4 items-center justify-center text-sm font-extrabold" },
        props.icon
      )
    : h(props.icon, { class: "w-4 h-4 flex-shrink-0" });
ModeIcon.props = ["icon"];

// What each mode is for. The weekly challenge and the course only show up
// while they're being played (the bar decides), in the group they belong to.
const GROUPS = [
  { id: "tests", modes: ["time", "words", "numbers", "weekly"] },
  { id: "texts", modes: ["quote", "classics", "dictation", "code", "custom"] },
  { id: "practice", modes: ["drill", "fingers", "zen", "lesson"] },
];

// With the menu open, one key per mode, no Alt: the name's letter where it
// can be, and the rest the one that stands out (cLásicos, cOdigo, Mi texto,
// dedos under F, where the index finger rests)
const MODE_KEYS = {
  time: "t",
  words: "p",
  numbers: "n",
  quote: "c",
  classics: "l",
  dictation: "d",
  code: "o",
  custom: "m",
  drill: "e",
  fingers: "f",
  zen: "z",
  weekly: "s",
  lesson: "u",
};

const byId = computed(
  () =>
    new Map(
      props.options.map((option) => [
        option.value,
        { id: option.value, label: option.label, icon: option.icon },
      ])
    )
);

const groups = computed(() =>
  GROUPS.map((group) => ({
    id: group.id,
    modes: group.modes.map((id) => byId.value.get(id)).filter(Boolean),
  })).filter((group) => group.modes.length)
);

const current = computed(
  () =>
    byId.value.get(configStore.type) ?? {
      id: configStore.type,
      label: configStore.type,
      icon: "·",
    }
);

const open = ref(false);
const root = ref(null);
const button = ref(null);
const menu = ref(null);

const radios = () => [...(menu.value?.querySelectorAll("[role=radio]") ?? [])];

const toggle = async () => {
  open.value = !open.value;
  if (!open.value) return;
  // In on the mode that's on, so the arrows move from there
  await nextTick();
  menu.value?.querySelector("[aria-checked=true]")?.focus({ preventScroll: true });
};

const pick = (mode) => {
  if (!props.inline) open.value = false;
  if (configStore.type !== mode) configStore.handleType(mode);
};

// Arrows walk the modes in reading order; Esc closes and goes back to the
// button
const onMenuKeydown = (event) => {
  const items = radios();
  const index = items.indexOf(document.activeElement);
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (step && index !== -1) {
    event.preventDefault();
    items[(index + step + items.length) % items.length].focus();
  } else if (event.key === "Escape") {
    event.stopPropagation();
    open.value = false;
    button.value?.focus();
  }
};

// "M" (Modo) opens it, on the mode that's on
const hotkeys = useHotkeysStore();
if (!props.inline) {
  useHotkey("modeMenu", {
    key: "m",
    label: "typing.modeMenu.hotkey",
    enabled: () => configStore.settingsShown,
    run: () => toggle(),
  });
}

useMenuKeys(
  () => open.value,
  (event) => {
    const mode = Object.keys(MODE_KEYS).find(
      (id) => MODE_KEYS[id] === event.key.toLowerCase() && byId.value.has(id)
    );
    if (!mode) return false;
    pick(mode);
    return true;
  }
);

const closeOutside = (event) => {
  if (open.value && !root.value?.contains(event.target)) open.value = false;
};
onMounted(() => document.addEventListener("pointerdown", closeOutside));
onUnmounted(() => document.removeEventListener("pointerdown", closeOutside));
</script>
