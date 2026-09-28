<template>
  <nav class="sticky top-0 z-50 bg-paper-white">
    <div
      class="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <router-link
          to="/"
          active-class=""
          exact-active-class=""
          class="flex items-center gap-2.5 group"
          aria-label="SwiftFlow"
          :aria-keyshortcuts="hotkeys.ariaFor('go:test')"
        >
          <div
            class="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary border-2 border-b-4 border-primary-dark transition-transform duration-150 group-hover:scale-105 group-active:translate-y-0.5 group-active:border-b-2"
          >
            <BoltIcon class="w-5 h-5 text-white" />
            <KeyHint id="go:test" corner />
          </div>
          <!-- Just the mark on a phone: with every button on the right, the
             name pushed the last one off the edge -->
          <span
            class="hidden xs:inline font-display text-lg font-extrabold tracking-tight text-charcoal"
          >
            SwiftFlow
          </span>
        </router-link>
        <!-- Daily streak: a glanceable reminder even outside /historial,
             colored with the same flame ramp as the in-session badge. Next
             to the name and without a border: it's a number to see, and a
             bordered chip among the page buttons read as the page you're on. -->
        <Transition
          enter-active-class="transition-[opacity,scale] duration-500 ease-spring"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-[opacity,scale] duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-50"
        >
          <router-link
            v-if="historyStore.dailyStreak > 0"
            :to="{ path: '/historial', hash: '#racha' }"
            :style="streakStyle"
            active-class=""
            exact-active-class=""
            class="relative flex items-center gap-1 h-8 px-2 rounded-lg text-sm font-extrabold transition-[scale,color,background-color] duration-300 ease-spring hover:scale-105 active:scale-95"
            :aria-label="t('shared.nav.streak', historyStore.dailyStreak)"
            :title="
              streakReminder.risk.atRisk
                ? t('shared.nav.streakAtRisk', streakReminder.timeLeft)
                : t('shared.nav.streak', historyStore.dailyStreak)
            "
            :class="{ 'animate-streak-risk': streakReminder.risk.atRisk }"
            :aria-keyshortcuts="hotkeys.ariaFor('go:streak')"
          >
            <FireIcon class="w-4 h-4" />
            <AnimatedNumber :value="historyStore.dailyStreak" :duration="600" />
            <KeyHint id="go:streak" corner />
          </router-link>
        </Transition>
      </div>

      <div class="flex items-center gap-2">
        <!-- The command palette, and the keys that open it: there's no
             keyboard to press them on a phone -->
        <button
          type="button"
          class="hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-95"
          :aria-label="t('palette.openHint', paletteKeys())"
          :title="t('palette.openHint', paletteKeys())"
          aria-keyshortcuts="Control+K Meta+K"
          @click="palette.open()"
        >
          <CommandLineIcon class="w-4 h-4" />
          <kbd class="font-mono text-[11px] font-bold">{{ paletteKeys() }}</kbd>
        </button>

        <!-- Level, once there's any experience to show -->
        <LevelBadge v-if="historyStore.experience > 0" />

        <!-- The course; on a phone it's reached from the home screen and the
             landing, where there's room -->
        <router-link
          to="/curso"
          :active-class="ACTIVE_PAGE"
          class="relative hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          :aria-label="t('shared.nav.course')"
          :title="t('shared.nav.course')"
          :aria-keyshortcuts="hotkeys.ariaFor('go:course')"
        >
          <AcademicCapIcon class="w-5 h-5" />
          <KeyHint id="go:course" corner />
        </router-link>

        <router-link
          to="/historial"
          :active-class="ACTIVE_PAGE"
          class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          :aria-label="t('shared.nav.history')"
          :aria-keyshortcuts="hotkeys.ariaFor('go:history')"
        >
          <ChartBarIcon class="w-5 h-5" />
          <KeyHint id="go:history" corner />
        </router-link>

        <!-- The landing: what SwiftFlow is, for whoever hasn't seen it -->
        <router-link
          to="/sobre"
          :active-class="ACTIVE_PAGE"
          class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          :aria-label="t('shared.nav.about')"
          :title="t('shared.nav.about')"
          :aria-keyshortcuts="hotkeys.ariaFor('go:about')"
        >
          <InformationCircleIcon class="w-5 h-5" />
          <KeyHint id="go:about" corner />
        </router-link>

        <SoundSettingsMenu />

        <button
          type="button"
          class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          :aria-label="
            themeStore.isDark ? t('shared.nav.lightMode') : t('shared.nav.darkMode')
          "
          :aria-keyshortcuts="hotkeys.ariaFor('theme')"
          @click="themeStore.toggleTheme"
        >
          <Transition
            mode="out-in"
            enter-active-class="transition-[opacity,rotate,scale] duration-300 ease-spring"
            enter-from-class="opacity-0 -rotate-90 scale-50"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-[opacity,rotate,scale] duration-150 ease-in"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 rotate-90 scale-50"
          >
            <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </Transition>
          <KeyHint id="theme" corner />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { BoltIcon } from "@heroicons/vue/24/solid";
import {
  SunIcon,
  MoonIcon,
  ChartBarIcon,
  FireIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  CommandLineIcon,
} from "@heroicons/vue/24/outline";
import { useThemeStore } from "@/shared/stores/theme";
import { t } from "@/shared/i18n";
import { useHistoryStore } from "@/features/history/store";
import { getDailyStreakColorRgb } from "@/shared/utils/flameColor";
import { useContrastStore } from "@/shared/stores/contrast";
import SoundSettingsMenu from "@/shared/components/SoundSettingsMenu.vue";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import { useStreakReminderStore } from "@/features/history/streakReminder";
import LevelBadge from "@/features/history/components/LevelBadge.vue";
import { usePaletteStore } from "@/features/command-palette/store";
import { paletteKeys } from "@/features/command-palette/keys";
import { useHotkey, useHotkeysStore } from "@/features/command-palette/hotkeys";
import KeyHint from "@/features/command-palette/components/KeyHint.vue";

const themeStore = useThemeStore();

// The page you're on: its button lit up, the way a picked option is
const ACTIVE_PAGE = "!border-primary/60 !bg-primary-tint !text-primary";
const hotkeys = useHotkeysStore();
const router = useRouter();
const route = useRoute();

// The nav's own keys, a badge on each button. On the test they take Alt
// like every other button's there; the letters dodge the ones a Mac turns
// into an accent with ⌥ (E, I, N, U).
const goTo = (id, key, to, { name, keepHere = false, shown = () => true } = {}) =>
  useHotkey(id, {
    key,
    inPalette: false,
    // A section of a page can be gone to from that page; a page, not
    enabled: () => shown() && (keepHere || route.name !== name),
    run: () => router.push(to),
  });
goTo("go:test", "p", "/", { name: "home" });
goTo(
  "go:level",
  "x",
  { path: "/historial", hash: "#nivel" },
  { keepHere: true, shown: () => historyStore.experience > 0 }
);
goTo(
  "go:streak",
  "y",
  { path: "/historial", hash: "#racha" },
  { keepHere: true, shown: () => historyStore.dailyStreak > 0 }
);
goTo("go:course", "o", "/curso", { name: "course" });
goTo("go:history", "h", "/historial", { name: "history" });
goTo("go:about", "q", "/sobre", { name: "about" });
useHotkey("theme", {
  key: "t",
  inPalette: false,
  run: () => themeStore.toggleTheme(),
});
const palette = usePaletteStore();
const historyStore = useHistoryStore();
// Today not practiced yet: the streak chip pulses until it is
const streakReminder = useStreakReminderStore();

const contrast = useContrastStore();
const streakStyle = computed(() => {
  const [r, g, b] = getDailyStreakColorRgb(historyStore.dailyStreak);
  return {
    // The number in the text color when it has to be readable above all
    color: contrast.high ? "var(--color-charcoal)" : `rgb(${r} ${g} ${b})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
  };
});
</script>

<style scoped>
/* A ring pulsing out of the streak chip while today is still missing */
@keyframes streak-risk {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent);
  }
  70%,
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}

.animate-streak-risk {
  animation: streak-risk 1.8s ease-out infinite;
}
</style>
