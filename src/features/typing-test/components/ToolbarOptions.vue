<template>
  <!--
    How any mode is played, on desktop: punctuation, "sin red" and the
    demanding modes, together behind one button that says how many are on.
    They go with every mode, so they don't need to sit in the bar.
    `inline`, for the phone's settings sheet: a section that folds open in
    place.
  -->
  <div ref="root" :class="inline ? '' : 'relative'">
    <button
      type="button"
      :aria-expanded="open"
      :aria-label="t('typing.options.label', activeCount)"
      :aria-keyshortcuts="hotkeys.ariaFor('options')"
      :data-options-button="inline ? undefined : ''"
      :data-options-inline="inline ? '' : undefined"
      class="relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-2.5 py-1.5 text-xs font-extrabold transition-[background-color,border-color,color,scale] duration-200 ease-spring active:scale-95"
      :class="[
        open || activeCount
          ? 'border-primary/50 bg-primary-tint text-primary'
          : 'border-faded-gray/60 text-pencil-gray hover:text-charcoal',
        inline ? 'w-full py-2.5 text-sm' : '',
      ]"
      @click="open = !open"
    >
      <AdjustmentsHorizontalIcon class="w-4 h-4" />
      {{ t("typing.options.button") }}
      <span
        v-if="activeCount"
        class="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white"
        aria-hidden="true"
        >{{ activeCount }}</span
      >
      <ChevronDownIcon
        class="w-3.5 h-3.5 transition-transform duration-200"
        :class="[{ 'rotate-180': open }, inline ? 'ml-auto' : '']"
      />
      <KeyHint v-if="!inline" id="options" corner />
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
        v-if="open"
        ref="panel"
        :class="
          inline
            ? 'mt-3'
            : 'absolute right-0 top-full z-40 mt-3 w-80 rounded-card border-2 border-faded-gray bg-paper-white p-4 shadow-xl'
        "
      >
        <div class="mb-4 flex flex-col gap-1.5">
          <button
            v-for="toggle in toggles"
            :key="toggle.id"
            type="button"
            :aria-pressed="toggle.on"
            class="flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors duration-200"
            :class="
              toggle.on
                ? 'border-primary bg-primary-tint'
                : 'border-faded-gray hover:border-primary/50'
            "
            @click="toggle.flip"
          >
            <component
              :is="toggle.icon"
              class="w-4 h-4 flex-shrink-0"
              :class="toggle.on ? 'text-primary' : 'text-pencil-gray'"
            />
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2 text-sm font-extrabold text-charcoal"
                >{{ toggle.label }}<KeyCap>{{ toggle.key.toUpperCase() }}</KeyCap></span
              >
              <span class="block text-xs font-bold text-pencil-gray">{{
                toggle.detail
              }}</span>
            </span>
            <!-- A switch: what's on reads at a glance -->
            <span
              class="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200"
              :class="toggle.on ? 'bg-primary' : 'bg-faded-gray'"
              aria-hidden="true"
            >
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200"
                :class="toggle.on ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </span>
          </button>
        </div>
        <div class="border-t-2 border-faded-gray pt-4">
          <StrictModePicker inline />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import {
  AdjustmentsHorizontalIcon,
  AtSymbolIcon,
  ChevronDownIcon,
  EyeSlashIcon,
} from "@heroicons/vue/24/outline";
import { t } from "@/shared/i18n";
import { useConfigStore } from "@/features/typing-test/store";
import StrictModePicker from "./StrictModePicker.vue";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";
import KeyCap from "@/features/command-palette/components/KeyCap.vue";
import {
  useHotkey,
  useHotkeysStore,
  useMenuKeys,
} from "@/features/command-palette/hotkeys";
import { STRICT_KEYS, ACCURACY_KEYS } from "@/features/typing-test/utils/strictModes";

const props = defineProps({
  // Whether punctuation is a choice in this mode (code is typed as-is)
  punctuationApplies: { type: Boolean, default: true },
  // Folding open in place: the phone's settings sheet
  inline: { type: Boolean, default: false },
});

const configStore = useConfigStore();
const open = ref(false);
const root = ref(null);

const toggles = computed(() => [
  ...(props.punctuationApplies
    ? [
        {
          id: "punctuation",
          key: "p",
          icon: AtSymbolIcon,
          label: t("typing.toolbar.punctuation"),
          detail: t("typing.options.punctuationHint"),
          on: configStore.selectedContentTypes === "punctuation",
          flip: () => configStore.handleContentTypes("punctuation"),
        },
      ]
    : []),
  {
    id: "blind",
    key: "s",
    icon: EyeSlashIcon,
    label: t("typing.toolbar.blind"),
    detail: t("typing.options.blindHint"),
    on: configStore.blindMode,
    flip: () => configStore.toggleBlindMode(),
  },
]);

const activeCount = computed(
  () =>
    toggles.value.filter((toggle) => toggle.on).length +
    (configStore.strictMode ? 1 : 0) +
    (configStore.minAccuracy ? 1 : 0)
);

// "W" opens them, with the focus on the first one: Space flips it
const hotkeys = useHotkeysStore();
const panel = ref(null);
if (!props.inline) {
  useHotkey("options", {
    key: "w",
    label: "typing.options.button",
    enabled: () => configStore.settingsShown,
    run: async () => {
      open.value = !open.value;
      if (!open.value) return;
      await nextTick();
      panel.value?.querySelector("button")?.focus({ preventScroll: true });
    },
  });
}

// Open, each option by its key: P, S, M, C, and 0/9/5/8 for the accuracy
useMenuKeys(
  () => open.value && !props.inline,
  (event) => {
    const key = event.key.toLowerCase();
    const toggle = toggles.value.find((entry) => entry.key === key);
    if (toggle) {
      toggle.flip();
      return true;
    }
    const strict = Object.keys(STRICT_KEYS).find(
      (id) => STRICT_KEYS[id] === key.toUpperCase()
    );
    if (strict) {
      configStore.setStrictMode(strict);
      return true;
    }
    const accuracy = ACCURACY_KEYS.find(([digit]) => digit === key);
    if (accuracy) {
      configStore.setMinAccuracy(accuracy[1]);
      return true;
    }
    return false;
  }
);

const closeOutside = (event) => {
  if (props.inline) return;
  if (open.value && !root.value?.contains(event.target)) open.value = false;
};
const closeOnEscape = (event) => {
  if (open.value && event.key === "Escape") open.value = false;
};
onMounted(() => {
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("keydown", closeOnEscape);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", closeOutside);
  document.removeEventListener("keydown", closeOnEscape);
});
</script>
