<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
      :aria-label="
        soundStore.soundEnabled
          ? t('shared.settings.button')
          : t('shared.settings.buttonMuted')
      "
      :aria-expanded="open"
      :aria-keyshortcuts="hotkeys.ariaFor('settings')"
      @click="open = !open"
    >
      <SpeakerWaveIcon v-if="soundStore.soundEnabled" class="w-5 h-5" />
      <SpeakerXMarkIcon v-else class="w-5 h-5" />
      <KeyHint id="settings" corner />
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-spring"
      enter-from-class="opacity-0 -translate-y-1 scale-90"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-64 origin-top-right bg-paper-white rounded-card border-2 border-faded-gray p-3 shadow-lg z-50"
      >
        <!-- The app's language, and apart from it, the texts' -->
        <div class="mb-2 space-y-2 border-b-2 border-faded-gray/40 pb-3">
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 text-xs font-bold text-charcoal"
              >{{ t("shared.language") }}<KeyCap>I</KeyCap></span
            >
            <SegmentedControl
              :label="t('shared.language')"
              :options="LANGUAGE_OPTIONS"
              :model-value="locale"
              @select="setLocale"
            />
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 text-xs font-bold text-charcoal">
              {{ t("shared.practiceLanguage") }}<KeyCap>P</KeyCap>
            </span>
            <SegmentedControl
              :label="t('shared.practiceLanguage')"
              :options="LANGUAGE_OPTIONS"
              :model-value="configStore.textLanguage"
              @select="configStore.setTextLanguage"
            />
          </div>
        </div>
        <div
          v-for="toggleItem in toggles"
          :key="toggleItem.key"
          class="flex items-center justify-between gap-3 py-1.5"
        >
          <span
            class="flex items-center gap-2 text-xs font-bold"
            :class="
              toggleItem.key !== 'soundEnabled' && !soundStore.soundEnabled
                ? 'text-pencil-gray/50'
                : 'text-charcoal'
            "
          >
            {{ toggleItem.label }}<KeyCap>{{ toggleItem.letter }}</KeyCap>
          </span>
          <button
            type="button"
            class="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            :class="soundStore[toggleItem.key] ? 'bg-primary' : 'bg-faded-gray'"
            :aria-label="`${toggleItem.label}: ${soundStore[toggleItem.key] ? t('shared.settings.on') : t('shared.settings.off')}`"
            @click="soundStore.toggle(toggleItem.key)"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ease-spring"
              :class="soundStore[toggleItem.key] ? 'translate-x-4' : 'translate-x-0'"
            ></span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";
import {
  useHotkey,
  useHotkeysStore,
  useMenuKeys,
} from "@/features/command-palette/hotkeys";
import KeyCap from "@/features/command-palette/components/KeyCap.vue";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import { t, locale, setLocale, LOCALES } from "@/shared/i18n";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/vue/24/outline";
import { useSoundStore } from "@/shared/stores/sound";
import { useConfigStore } from "@/features/typing-test/store";

const soundStore = useSoundStore();
const configStore = useConfigStore();
const open = ref(false);
const rootEl = ref(null);

// "Z" beside the button; in from the keyboard, the focus goes in with it
const hotkeys = useHotkeysStore();
useHotkey("settings", {
  key: "z",
  inPalette: false,
  run: async () => {
    open.value = !open.value;
    if (!open.value) return;
    await nextTick();
    rootEl.value?.querySelectorAll("button")[1]?.focus({ preventScroll: true });
  },
});

// Each language named in itself, so it can be found whatever is showing
const LANGUAGE_OPTIONS = LOCALES.map(({ id, label }) => ({ value: id, label }));

const toggles = computed(() => [
  { key: "soundEnabled", letter: "S", label: t("shared.settings.all") },
  { key: "keystrokeSound", letter: "T", label: t("shared.settings.keystrokes") },
  { key: "errorSound", letter: "E", label: t("shared.settings.errors") },
  { key: "celebrationSound", letter: "L", label: t("shared.settings.celebrations") },
]);

// Open, each row by its letter: I the app's language, P the texts', and
// S, T, E, L the sounds -- the languages flip to the other one
const otherLanguage = (current) => {
  const ids = LOCALES.map(({ id }) => id);
  return ids[(ids.indexOf(current) + 1) % ids.length];
};
useMenuKeys(
  () => open.value,
  (event) => {
    const key = event.key.toUpperCase();
    if (key === "I") {
      setLocale(otherLanguage(locale.value));
      return true;
    }
    if (key === "P") {
      configStore.setTextLanguage(otherLanguage(configStore.textLanguage));
      return true;
    }
    const toggle = toggles.value.find((entry) => entry.letter === key);
    if (!toggle) return false;
    soundStore.toggle(toggle.key);
    return true;
  }
);

// Sub-toggles stay independently readable/writable even while the master
// switch is off — their dimmed label is just a hint that they won't
// audibly matter until sound is back on, not a hard lock.
const handleClickOutside = (event) => {
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
