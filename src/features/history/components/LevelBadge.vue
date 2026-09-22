<template>
  <!-- The level with a ring filling toward the next one, for the nav -->
  <router-link
    to="/historial"
    class="group relative flex h-9 items-center gap-1.5 rounded-xl border-2 border-faded-gray pl-1 pr-2.5 text-xs font-extrabold text-charcoal transition-[scale,border-color] duration-300 ease-spring hover:scale-105 hover:border-primary/60 active:scale-95"
    :aria-label="`Nivel ${level.level}, ${level.title}`"
  >
    <svg viewBox="0 0 28 28" class="h-7 w-7" aria-hidden="true">
      <circle
        cx="14"
        cy="14"
        :r="RADIUS"
        fill="none"
        stroke-width="3"
        class="stroke-faded-gray/50"
      />
      <circle
        cx="14"
        cy="14"
        :r="RADIUS"
        fill="none"
        stroke-width="3"
        stroke-linecap="round"
        :stroke="color"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="CIRCUMFERENCE * (1 - level.fraction)"
        transform="rotate(-90 14 14)"
        class="transition-[stroke-dashoffset] duration-700 ease-smooth"
      />
      <text
        x="14"
        y="14"
        text-anchor="middle"
        dominant-baseline="central"
        class="fill-charcoal font-display text-[11px] font-extrabold"
      >
        {{ level.level }}
      </text>
    </svg>
    <span class="hidden sm:inline">{{ level.title }}</span>

    <div
      class="pointer-events-none absolute top-full right-0 z-50 mt-2 w-max rounded-xl bg-night-ink px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <template v-if="level.isMax"
        >Nivel máximo · {{ level.xpIntoLevel }} XP de más</template
      >
      <template v-else>
        {{ level.xpIntoLevel }}/{{ level.xpForNextLevel }} XP para el nivel
        {{ level.level + 1 }}
      </template>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from "vue";
import { useHistoryStore } from "@/features/history/store";

const RADIUS = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const historyStore = useHistoryStore();
const level = computed(() => historyStore.level);
const color = computed(() => `rgb(${level.value.tier.rgb.join(" ")})`);
</script>
