<template>
  <!--
    How the text to type looks: font, size, line spacing and the caret's
    motion, with a line of sample text showing each change as it's made.
    Opens upward from the row of buttons under the text, like the pacer --
    but out in the body: the text's box clips whatever leaves it, and on a
    phone this is taller than the room above the button.
  -->
  <div ref="root" class="relative">
    <IconButton
      icon="text-style"
      :variant="open ? 'primary' : 'secondary'"
      size="lg"
      :tooltip="open ? '' : t('typing.appearance.button')"
      :aria-label="t('typing.appearance.button')"
      :aria-expanded="open"
      @click="toggle"
    />
    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,translate] duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          ref="menu"
          role="dialog"
          :aria-label="t('typing.appearance.dialog')"
          class="fixed z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-card border-2 border-faded-gray bg-paper-white p-4 text-left shadow-xl"
          :style="menuStyle"
        >
          <!-- The sample, drawn with the settings as they are -->
          <div
            class="mb-4 overflow-hidden rounded-xl bg-faded-gray/15 px-3 py-2 text-charcoal"
            aria-hidden="true"
          >
            <p class="truncate tracking-wide" :style="sampleStyle">
              <span class="text-success">{{ t("typing.appearance.sampleTyped") }}</span
              ><span class="relative"
                >{{ t("typing.appearance.sampleNext")
                }}<span
                  class="absolute -left-0.5 top-[15%] h-[70%] w-[3px] rounded-full bg-primary"
                ></span></span
              >{{ t("typing.appearance.sampleRest") }}
            </p>
          </div>

          <label class="mb-3 block">
            <span class="mb-1 block text-xs font-bold text-pencil-gray">{{
              t("typing.appearance.font")
            }}</span>
            <select
              :value="store.appearance.font"
              class="w-full cursor-pointer rounded-xl border-2 border-faded-gray bg-paper-white px-2.5 py-1.5 text-sm font-bold text-charcoal focus:border-primary focus:outline-none"
              @change="store.set('font', $event.target.value)"
            >
              <option v-for="font in TEXT_FONTS" :key="font.id" :value="font.id">
                {{ font.label }}
              </option>
            </select>
          </label>

          <div
            v-for="setting in settings"
            :key="setting.field"
            class="mb-3 flex items-center justify-between gap-3 last:mb-0"
          >
            <span class="text-xs font-bold text-pencil-gray">{{ setting.label }}</span>
            <SegmentedControl
              :label="setting.label"
              :options="setting.options"
              :model-value="store.appearance[setting.field]"
              @select="store.set(setting.field, $event)"
            />
          </div>

          <!-- Not just the text: the whole app's colors -->
          <div
            class="mt-4 flex items-center justify-between gap-3 border-t-2 border-faded-gray/40 pt-3"
          >
            <span id="contrast-label" class="text-xs font-bold text-pencil-gray">
              {{ t("typing.appearance.contrast") }}
              <span class="block">{{ t("typing.appearance.contrastScope") }}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-labelledby="contrast-label"
              :aria-checked="contrast.high"
              class="relative h-6 w-10 flex-shrink-0 rounded-full border-2 transition-colors duration-200"
              :class="
                contrast.high
                  ? 'border-primary bg-primary'
                  : 'border-faded-gray bg-faded-gray/40'
              "
              @click="contrast.setHigh(!contrast.high)"
            >
              <span
                class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-spring"
                :class="contrast.high ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <button
            v-if="!isDefault"
            type="button"
            class="mt-3 block w-full text-center text-xs font-bold text-pencil-gray underline underline-offset-2 hover:text-primary"
            @click="reset"
          >
            {{ t("typing.appearance.reset") }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import IconButton from "@/shared/components/IconButton.vue";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import { useTextAppearanceStore } from "@/shared/stores/textAppearance";
import { useContrastStore } from "@/shared/stores/contrast";
import { t } from "@/shared/i18n";
import {
  TEXT_FONTS,
  TEXT_SIZES,
  LINE_HEIGHTS,
  CARET_MOTIONS,
  FOCUS_OPTIONS,
  TEXT_APPEARANCE_DEFAULTS,
  optionOf,
} from "@/shared/utils/textAppearance";

const store = useTextAppearanceStore();
const contrast = useContrastStore();
const open = ref(false);
const root = ref(null);
const menu = ref(null);

// Centered over the button and just above it, but never past the screen's
// edges (16px of margin, as the menu's own max width leaves)
const MARGIN = 16;
const GAP = 12;
const anchor = ref(null);
const menuStyle = computed(() => {
  if (!anchor.value) return {};
  const { center, top } = anchor.value;
  const half = Math.min(352, window.innerWidth - 2 * MARGIN) / 2;
  const left = Math.min(
    Math.max(center, MARGIN + half),
    window.innerWidth - MARGIN - half
  );
  return {
    left: `${left}px`,
    bottom: `${window.innerHeight - top + GAP}px`,
    transform: "translateX(-50%)",
  };
});
const measure = () => {
  const rect = root.value?.getBoundingClientRect();
  if (rect) anchor.value = { center: rect.left + rect.width / 2, top: rect.top };
};
const toggle = () => {
  if (!open.value) measure();
  open.value = !open.value;
};

const toOptions = (options) => options.map(({ id, label }) => ({ value: id, label }));
// Computed, so the labels follow a change of language
const settings = computed(() => [
  { field: "size", label: t("typing.appearance.size"), options: toOptions(TEXT_SIZES) },
  {
    field: "lineHeight",
    label: t("typing.appearance.lineHeight"),
    options: toOptions(LINE_HEIGHTS),
  },
  {
    field: "caretMotion",
    label: t("typing.appearance.caret"),
    options: toOptions(CARET_MOTIONS),
  },
  // Just the word being typed and the next, big and centered
  {
    field: "focus",
    label: t("typing.appearance.focus"),
    options: toOptions(FOCUS_OPTIONS),
  },
]);

// The sample's font and spacing as picked, at a size that fits the menu
// but still grows and shrinks with the setting
const sampleStyle = computed(() => ({
  fontFamily: optionOf("font", store.appearance.font).family,
  fontSize: `${optionOf("size", store.appearance.size).mobile - 2}px`,
  lineHeight: optionOf("lineHeight", store.appearance.lineHeight).value,
}));

const isDefault = computed(() =>
  Object.entries(TEXT_APPEARANCE_DEFAULTS).every(
    ([field, id]) => store.appearance[field] === id
  )
);
const reset = () => {
  for (const [field, id] of Object.entries(TEXT_APPEARANCE_DEFAULTS))
    store.set(field, id);
};

const closeOutside = (event) => {
  if (!open.value) return;
  if (root.value?.contains(event.target) || menu.value?.contains(event.target)) return;
  open.value = false;
};
const remeasure = () => {
  if (open.value) measure();
};
const closeOnEscape = (event) => {
  if (open.value && event.key === "Escape") {
    event.stopPropagation();
    open.value = false;
  }
};
onMounted(() => {
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("keydown", closeOnEscape, true);
  window.addEventListener("resize", remeasure);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", closeOutside);
  document.removeEventListener("keydown", closeOnEscape, true);
  window.removeEventListener("resize", remeasure);
});
</script>
