<template>
  <!--
    The demanding modes: what a mistake does, and the accuracy a run needs
    to count. On desktop a chip in the bar that opens them; in the phone's
    settings sheet (`inline`) the same choices laid out in place.
  -->
  <div v-if="inline" class="flex flex-col items-center gap-2">
    <StrictOptions />
  </div>

  <div v-else ref="root" class="relative">
    <button
      type="button"
      :aria-expanded="open"
      :aria-pressed="active"
      :aria-label="t('typing.strict.buttonLabel', active ? summary : null)"
      :title="t('typing.strict.button')"
      class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-2.5 py-1.5 text-xs font-extrabold transition-[background-color,border-color,color,scale] duration-200 ease-spring active:scale-95"
      :class="
        active || open
          ? 'border-primary/50 bg-primary-tint text-primary'
          : 'border-faded-gray/60 text-pencil-gray hover:text-charcoal'
      "
      @click="open = !open"
    >
      <HeartIcon class="w-4 h-4" />
      <span class="hidden xl:inline">{{ summary }}</span>
      <ChevronDownIcon
        class="w-3.5 h-3.5 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
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
        class="absolute left-0 top-full z-40 mt-3 w-72 rounded-card border-2 border-faded-gray bg-paper-white p-4 shadow-xl"
      >
        <StrictOptions />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted } from "vue";
import { HeartIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import { t } from "@/shared/i18n";
import { useConfigStore } from "@/features/typing-test/store";
import {
  STRICT_MODES,
  MIN_ACCURACY_OPTIONS,
  strictModeById,
} from "@/features/typing-test/utils/strictModes";

defineProps({
  // Laid out in place, for the phone's settings sheet
  inline: { type: Boolean, default: false },
});

const configStore = useConfigStore();
const open = ref(false);
const root = ref(null);

const active = computed(() => Boolean(configStore.strictMode || configStore.minAccuracy));

// What the chip says: what's on, or what it is
const summary = computed(() => {
  const parts = [
    strictModeById(configStore.strictMode)?.short,
    configStore.minAccuracy && `${configStore.minAccuracy}%`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : t("typing.strict.summaryNone");
});

const accuracyOptions = () => [
  { value: null, label: t("typing.strict.off") },
  ...MIN_ACCURACY_OPTIONS.map((value) => ({ value, label: `${value}%` })),
];

// The choices themselves, shared by both layouts
const StrictOptions = () => [
  h(
    "p",
    { class: "mb-2 text-xs font-bold text-pencil-gray", id: "strict-mistake-label" },
    t("typing.strict.aMistake")
  ),
  h(
    "div",
    {
      class: "mb-4 flex w-full flex-col gap-1.5",
      role: "group",
      "aria-labelledby": "strict-mistake-label",
    },
    STRICT_MODES.map((mode) =>
      h(
        "button",
        {
          type: "button",
          "aria-pressed": configStore.strictMode === mode.id,
          class: [
            "w-full rounded-xl border-2 px-3 py-2 text-left transition-colors duration-200",
            configStore.strictMode === mode.id
              ? "border-primary bg-primary-tint"
              : "border-faded-gray hover:border-primary/50",
          ],
          onClick: () => configStore.setStrictMode(mode.id),
        },
        [
          h("span", { class: "block text-sm font-extrabold text-charcoal" }, mode.label),
          h("span", { class: "block text-xs font-bold text-pencil-gray" }, mode.detail),
        ]
      )
    )
  ),
  h("div", { class: "flex w-full items-center justify-between gap-3" }, [
    h(
      "span",
      { class: "text-xs font-bold text-pencil-gray" },
      t("typing.strict.minAccuracy")
    ),
    h(SegmentedControl, {
      label: t("typing.strict.minAccuracy"),
      options: accuracyOptions(),
      modelValue: configStore.minAccuracy,
      onSelect: (value) => configStore.setMinAccuracy(value),
    }),
  ]),
  h(
    "p",
    { class: "mt-3 text-[11px] font-bold text-pencil-gray" },
    t("typing.strict.footnote")
  ),
];

const closeOutside = (event) => {
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
