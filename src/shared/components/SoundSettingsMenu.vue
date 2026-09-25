<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
      :aria-label="
        soundStore.soundEnabled
          ? t('shared.settings.button')
          : t('shared.settings.buttonMuted')
      "
      @click="open = !open"
    >
      <SpeakerWaveIcon v-if="soundStore.soundEnabled" class="w-5 h-5" />
      <SpeakerXMarkIcon v-else class="w-5 h-5" />
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
        <!-- The app's language: the interface, not what's practiced -->
        <div
          class="mb-2 flex items-center justify-between gap-3 border-b-2 border-faded-gray/40 pb-3"
        >
          <span class="text-xs font-bold text-charcoal">{{ t("shared.language") }}</span>
          <SegmentedControl
            :label="t('shared.language')"
            :options="LANGUAGE_OPTIONS"
            :model-value="locale"
            @select="setLocale"
          />
        </div>
        <div
          v-for="toggleItem in toggles"
          :key="toggleItem.key"
          class="flex items-center justify-between gap-3 py-1.5"
        >
          <span
            class="text-xs font-bold"
            :class="
              toggleItem.key !== 'soundEnabled' && !soundStore.soundEnabled
                ? 'text-pencil-gray/50'
                : 'text-charcoal'
            "
          >
            {{ toggleItem.label }}
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import { t, locale, setLocale, LOCALES } from "@/shared/i18n";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/vue/24/outline";
import { useSoundStore } from "@/shared/stores/sound";

const soundStore = useSoundStore();
const open = ref(false);
const rootEl = ref(null);

// Each language named in itself, so it can be found whatever is showing
const LANGUAGE_OPTIONS = LOCALES.map(({ id, label }) => ({ value: id, label }));

const toggles = computed(() => [
  { key: "soundEnabled", label: t("shared.settings.all") },
  { key: "keystrokeSound", label: t("shared.settings.keystrokes") },
  { key: "errorSound", label: t("shared.settings.errors") },
  { key: "celebrationSound", label: t("shared.settings.celebrations") },
]);

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
