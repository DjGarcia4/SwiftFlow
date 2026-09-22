<template>
  <!--
    Every rank from Novato to the top, so there's always something to see
    ahead: the ones passed in their color, the current one with how far
    through it you are, and the rest locked, with the experience they take.
  -->
  <ol class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <li
      v-for="(tier, index) in roadmap"
      :key="tier.title"
      class="relative flex flex-col items-center gap-1.5 rounded-card border-2 px-2 pt-3 pb-2.5 text-center animate-pop-in"
      :class="tier.state === 'locked' ? 'border-dashed' : ''"
      :style="{ ...tierStyle(tier), ...staggerStyle(index, { step: 40, base: 50 }) }"
    >
      <span
        v-if="tier.state === 'current'"
        class="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
        :style="{ backgroundColor: rgb(tier) }"
        >Estás acá</span
      >

      <!-- Locked ranks still wear their own look, just dimmed, so you can
           see what's coming -->
      <div class="relative">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          :class="{ 'opacity-45 saturate-50': tier.state === 'locked' }"
          :style="{ backgroundColor: rgb(tier) }"
        >
          <component :is="ACHIEVEMENT_ICONS[tier.icon]" class="w-6 h-6" />
        </div>
        <div
          v-if="tier.state === 'locked'"
          class="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-paper-white bg-charcoal text-paper-white"
        >
          <LockClosedIcon class="w-3 h-3" />
        </div>
      </div>

      <div
        class="text-sm font-extrabold leading-tight"
        :class="{ 'opacity-60': tier.state === 'locked' }"
        :style="{ color: rgb(tier) }"
      >
        {{ tier.title }}
      </div>
      <div class="text-[11px] font-bold text-pencil-gray">
        {{
          tier.from === tier.to ? `Nivel ${tier.from}` : `Niveles ${tier.from}–${tier.to}`
        }}
      </div>

      <div v-if="tier.state === 'current'" class="w-full px-1">
        <div class="h-1.5 rounded-full bg-faded-gray/40 overflow-hidden">
          <div
            class="h-full rounded-full transition-[width] duration-700 ease-smooth"
            :style="{ width: `${tier.fraction * 100}%`, backgroundColor: rgb(tier) }"
          ></div>
        </div>
      </div>
      <div v-else class="text-[10px] font-bold text-pencil-gray/80">
        <template v-if="tier.state === 'done'">
          <CheckIcon class="inline w-3 h-3 -mt-0.5" /> Completado
        </template>
        <template v-else>desde {{ formatXp(tier.xpToReach) }} XP</template>
      </div>
    </li>
  </ol>
</template>

<script setup>
import { computed } from "vue";
import { LockClosedIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { ACHIEVEMENT_ICONS } from "@/features/history/achievementPresentation";
import { computeLevelRoadmap } from "@/features/history/utils/experience";
import { useHistoryStore } from "@/features/history/store";
import { staggerStyle } from "@/shared/utils/motion";

const historyStore = useHistoryStore();
const roadmap = computed(() => computeLevelRoadmap(historyStore.experience));

const rgb = (tier) => `rgb(${tier.rgb.join(" ")})`;

// Full color for the current rank, softer for the ones passed, faintest
// for the ones ahead
const TIER_TONE = {
  current: { border: 1, background: 0.12 },
  done: { border: 0.45, background: 0.06 },
  locked: { border: 0.3, background: 0.03 },
};

const tierStyle = (tier) => {
  const [r, g, b] = tier.rgb;
  const tone = TIER_TONE[tier.state];
  return {
    borderColor: `rgba(${r}, ${g}, ${b}, ${tone.border})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${tone.background})`,
  };
};

const formatXp = (xp) => xp.toLocaleString("es");
</script>
