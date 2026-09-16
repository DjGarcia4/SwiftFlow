<template>
  <nav class="sticky top-0 z-50 bg-paper-white">
    <div
      class="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2"
    >
      <router-link to="/" class="flex items-center gap-2.5 group">
        <div
          class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary border-2 border-b-4 border-primary-dark transition-transform duration-150 group-hover:scale-105 group-active:translate-y-0.5 group-active:border-b-2"
        >
          <BoltIcon class="w-5 h-5 text-white" />
        </div>
        <span class="font-display text-lg font-extrabold tracking-tight text-charcoal">
          SwiftFlow
        </span>
      </router-link>

      <div class="flex items-center gap-2">
        <!-- Daily streak: a glanceable reminder even outside /historial,
             colored with the same flame ramp as the in-session badge. -->
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
            to="/historial"
            :style="streakStyle"
            class="flex items-center gap-1 h-9 px-2.5 rounded-xl border-2 text-xs font-extrabold transition-[scale,color,border-color,background-color] duration-300 ease-spring hover:scale-105 active:scale-95"
            :aria-label="`Racha de ${historyStore.dailyStreak} días`"
          >
            <FireIcon class="w-4 h-4" />
            <AnimatedNumber :value="historyStore.dailyStreak" :duration="600" />
          </router-link>
        </Transition>

        <router-link
          to="/historial"
          class="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          aria-label="Ver historial"
        >
          <ChartBarIcon class="w-5 h-5" />
        </router-link>

        <SoundSettingsMenu />

        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-[color,background-color,scale] duration-200 ease-spring active:scale-90"
          :aria-label="themeStore.isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
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
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { BoltIcon } from "@heroicons/vue/24/solid";
import { SunIcon, MoonIcon, ChartBarIcon, FireIcon } from "@heroicons/vue/24/outline";
import { useThemeStore } from "@/shared/stores/theme";
import { useHistoryStore } from "@/features/history/store";
import { getDailyStreakColorRgb } from "@/shared/utils/flameColor";
import SoundSettingsMenu from "@/shared/components/SoundSettingsMenu.vue";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";

const themeStore = useThemeStore();
const historyStore = useHistoryStore();

const streakStyle = computed(() => {
  const [r, g, b] = getDailyStreakColorRgb(historyStore.dailyStreak);
  return {
    color: `rgb(${r} ${g} ${b})`,
    borderColor: `rgb(${r} ${g} ${b})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
  };
});
</script>

<style scoped></style>
