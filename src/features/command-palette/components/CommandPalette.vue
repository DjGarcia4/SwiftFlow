<template>
  <!-- Ctrl/⌘+K from anywhere: every setting and page from the keyboard -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-smooth"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="palette.isOpen"
      class="fixed inset-0 z-[70] flex items-start justify-center bg-night-ink/40 backdrop-blur-sm p-4 pt-[12vh]"
      @click.self="palette.close"
    >
      <div
        ref="dialog"
        class="w-full max-w-xl rounded-card border-2 border-faded-gray bg-paper-white shadow-xl animate-pop-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-label="
          palette.view === 'shortcuts' ? t('palette.shortcuts.title') : t('palette.title')
        "
        data-testid="command-palette"
      >
        <template v-if="palette.view === 'commands'">
          <div class="flex items-center gap-3 border-b-2 border-faded-gray px-4">
            <CommandLineIcon class="w-5 h-5 flex-shrink-0 text-pencil-gray" />
            <input
              ref="input"
              v-model="query"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="palette-list"
              :aria-activedescendant="activeId"
              :aria-label="t('palette.title')"
              :placeholder="t('palette.placeholder')"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              class="w-full bg-transparent py-4 text-base font-bold text-charcoal outline-none placeholder:text-pencil-gray/70"
              @keydown="onInputKeydown"
            />
          </div>

          <ul
            id="palette-list"
            ref="list"
            role="listbox"
            :aria-label="t('palette.title')"
            class="max-h-[50vh] overflow-y-auto p-2"
          >
            <template v-for="(row, index) in rows" :key="row.command.id">
              <li
                v-if="row.heading"
                role="presentation"
                class="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wide text-pencil-gray"
              >
                {{ row.heading }}
              </li>
              <li
                :id="optionId(index)"
                role="option"
                :aria-selected="index === activeIndex"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-100"
                :class="
                  index === activeIndex
                    ? 'bg-primary-tint text-charcoal'
                    : 'text-charcoal hover:bg-primary-tint/50'
                "
                @mousemove="activeIndex = index"
                @click="runAt(index, { pointer: true })"
              >
                <span
                  class="flex-shrink-0 min-w-[5.5rem] text-xs font-bold text-pencil-gray"
                  >{{ row.command.group }}</span
                >
                <span class="flex-1 font-bold truncate">{{ row.command.label }}</span>
                <span
                  v-if="row.command.active"
                  class="flex items-center gap-1 text-xs font-extrabold text-success-dark"
                >
                  <CheckIcon class="w-4 h-4" aria-hidden="true" />
                  <span class="sr-only">{{ t("palette.active") }}</span>
                </span>
              </li>
            </template>
            <li
              v-if="!rows.length"
              role="presentation"
              class="px-3 py-6 text-center text-sm font-bold text-pencil-gray"
            >
              {{ t("palette.noResults") }}
            </li>
          </ul>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-faded-gray px-4 py-2 text-[11px] font-bold text-pencil-gray"
          >
            <span
              ><kbd :class="kbdClass">↑</kbd> <kbd :class="kbdClass">↓</kbd>
              {{ t("palette.footer.move") }}</span
            >
            <span><kbd :class="kbdClass">Enter</kbd> {{ t("palette.footer.pick") }}</span>
            <span><kbd :class="kbdClass">Esc</kbd> {{ t("palette.footer.close") }}</span>
          </div>
        </template>

        <!-- The list of keys -->
        <div v-else class="p-5 sm:p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="font-display text-xl font-extrabold text-charcoal">
              {{ t("palette.shortcuts.title") }}
            </h2>
            <button
              ref="backButton"
              type="button"
              class="rounded-xl border-2 border-faded-gray px-3 py-1.5 text-xs font-bold text-pencil-gray transition-[color,background-color] duration-200 hover:bg-primary-tint/60 hover:text-primary"
              @click="palette.open('commands')"
            >
              {{ t("palette.shortcuts.back") }}
            </button>
          </div>
          <dl class="space-y-2.5">
            <div
              v-for="shortcut in shortcuts"
              :key="shortcut.keys.join('+')"
              class="flex items-center justify-between gap-4 text-sm"
            >
              <dt class="font-bold text-charcoal">{{ shortcut.label }}</dt>
              <dd class="flex flex-shrink-0 gap-1">
                <kbd v-for="key in shortcut.keys" :key="key" :class="kbdClass">{{
                  key
                }}</kbd>
              </dd>
            </div>
          </dl>
          <p class="mt-5 text-xs font-bold text-pencil-gray">
            {{ t("palette.shortcuts.tip") }}
          </p>
        </div>

        <p class="sr-only" aria-live="polite">{{ resultsAnnouncement }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CommandLineIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { t, locale, setLocale } from "@/shared/i18n";
import { useModalFocus } from "@/shared/composables/useModalFocus";
import { announce } from "@/shared/utils/announcer";
import { isSpeechSupported } from "@/shared/utils/speech";
import { useConfigStore } from "@/features/typing-test/store";
import { useThemeStore } from "@/shared/stores/theme";
import { useContrastStore } from "@/shared/stores/contrast";
import { useSoundStore } from "@/shared/stores/sound";
import { useTextAppearanceStore } from "@/shared/stores/textAppearance";
import { usePaletteStore } from "@/features/command-palette/store";
import { buildCommands } from "@/features/command-palette/commands";
import { searchCommands, withRecentFirst } from "@/features/command-palette/search";
import {
  isPaletteShortcut,
  isEditable,
  paletteKeys,
} from "@/features/command-palette/keys";

const palette = usePaletteStore();
const config = useConfigStore();
const theme = useThemeStore();
const contrast = useContrastStore();
const sound = useSoundStore();
const appearance = useTextAppearanceStore();
const route = useRoute();
const router = useRouter();
const canSpeak = isSpeechSupported();

const kbdClass =
  "px-1.5 py-0.5 bg-paper-white text-charcoal rounded-md font-mono text-[11px] border-2 border-faded-gray";

const dialog = ref(null);
const input = ref(null);
const list = ref(null);
const backButton = ref(null);
const query = ref("");
const activeIndex = ref(0);

// Built while open only: it reads a good part of the app's state
const commands = computed(() =>
  palette.isOpen
    ? buildCommands({
        config,
        theme,
        contrast,
        sound,
        appearance,
        palette,
        router,
        route,
        locale: locale.value,
        setLocale,
        canSpeak,
      })
    : []
);

// With nothing typed, the ones used last come first under their own heading
const rows = computed(() => {
  if (query.value.trim()) {
    return searchCommands(commands.value, query.value).map((command) => ({ command }));
  }
  const ordered = withRecentFirst(commands.value, palette.recent);
  const recentCount = palette.recent.filter((id) =>
    commands.value.some((command) => command.id === id)
  ).length;
  return ordered.map((command, index) => ({
    command,
    heading:
      recentCount && index === 0
        ? t("palette.recent")
        : recentCount && index === recentCount
          ? t("palette.title")
          : null,
  }));
});

const optionId = (index) => `palette-option-${index}`;
const activeId = computed(() =>
  rows.value.length ? optionId(activeIndex.value) : undefined
);

const resultsAnnouncement = computed(() =>
  palette.isOpen && palette.view === "commands" && query.value.trim()
    ? t("palette.announce.results", rows.value.length)
    : ""
);

watch(query, () => {
  activeIndex.value = 0;
  list.value?.scrollTo({ top: 0 });
});

const scrollToActive = () =>
  nextTick(() =>
    document
      .getElementById(optionId(activeIndex.value))
      ?.scrollIntoView({ block: "nearest" })
  );

const move = (step) => {
  const count = rows.value.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + step + count) % count;
  scrollToActive();
};

// Picked with the mouse, it isn't a keyboard-only setup
const runAt = (index, { pointer = false } = {}) => {
  const command = rows.value[index]?.command;
  if (!command) return;
  palette.run(command);
  if (pointer) palette.touchedWithPointer();
  if (!command.keepOpen) announce(t("palette.announce.done", command.label));
};

const onInputKeydown = (event) => {
  if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
    event.preventDefault();
    move(-1);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    move(5);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    move(-5);
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (!event.repeat) runAt(activeIndex.value);
  }
};

const shortcuts = computed(() => [
  { keys: [paletteKeys()], label: t("palette.shortcuts.palette") },
  { keys: ["Tab"], label: t("palette.shortcuts.restart") },
  { keys: [t("typing.results.space")], label: t("palette.shortcuts.again") },
  { keys: ["Esc"], label: t("palette.shortcuts.pause") },
  { keys: ["?"], label: t("palette.shortcuts.help") },
]);

// Focus moves in, stays in, and goes back where it was on close
useModalFocus({
  open: () => palette.isOpen,
  container: dialog,
  onClose: () => palette.close(),
  initialFocus: computed(() => (palette.view === "commands" ? input.value : null)),
});

// A fresh start every time it opens, and focus on what the view has
watch(
  () => [palette.isOpen, palette.view],
  async ([isOpen, view], [wasOpen] = []) => {
    if (!isOpen) return;
    if (!wasOpen || view === "commands") {
      query.value = "";
      activeIndex.value = 0;
    }
    if (!wasOpen) return;
    await nextTick();
    (view === "commands" ? input.value : backButton.value)?.focus({
      preventScroll: true,
    });
  }
);

// Into the search the moment it's drawn: a fast typist's first letter
// after Ctrl+K would otherwise land in the text being typed
watch(input, (element) => element?.focus({ preventScroll: true }), { flush: "post" });

// A run in progress waits while the palette is open, the way Esc pauses it
watch(
  () => palette.isOpen,
  (isOpen) => {
    if (isOpen && config.startTime && !config.isCompleted && !config.isPaused) {
      config.pause();
    }
  }
);

const onKeydown = (event) => {
  if (isPaletteShortcut(event)) {
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) palette.toggle();
    return;
  }
  // "?" for the keys -- where it can't be text being typed. The test takes
  // any key as typing, so there it's only in the palette.
  if (
    event.key === "?" &&
    !palette.isOpen &&
    route.name !== "home" &&
    !isEditable(event.target)
  ) {
    event.preventDefault();
    palette.open("shortcuts");
  }
};

// The mouse (or a finger) on the page: whatever's played next wasn't
// keyboard-only any more
const onPointerDown = () => palette.touchedWithPointer();

onMounted(() => {
  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("pointerdown", onPointerDown, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown, true);
  document.removeEventListener("pointerdown", onPointerDown, true);
});
</script>
