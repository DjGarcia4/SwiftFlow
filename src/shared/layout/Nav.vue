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
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-faded-gray text-pencil-gray hover:text-primary hover:bg-primary-tint/60 transition-colors duration-150"
          :aria-label="themeStore.isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
          @click="themeStore.toggleTheme"
        >
          <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { BoltIcon } from "@heroicons/vue/24/solid";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import { useThemeStore } from "@/shared/stores/theme";

const themeStore = useThemeStore();
</script>

<style scoped></style>
