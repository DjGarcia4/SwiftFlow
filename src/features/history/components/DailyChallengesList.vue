<template>
  <ul class="space-y-2">
    <li
      v-for="challenge in challenges"
      :key="challenge.id"
      class="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-[border-color,background-color] duration-300"
      :class="
        challenge.completed
          ? 'border-success/40 bg-success-tint/60'
          : 'border-faded-gray bg-paper-white'
      "
    >
      <div
        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
        :class="
          challenge.completed ? 'bg-success text-white' : 'bg-primary-tint text-primary'
        "
      >
        <CheckIcon v-if="challenge.completed" class="w-4.5 h-4.5 animate-pop-in" />
        <component :is="ACHIEVEMENT_ICONS[challenge.icon]" v-else class="w-4.5 h-4.5" />
      </div>

      <div class="min-w-0 flex-1">
        <div
          class="text-sm font-bold leading-snug"
          :class="challenge.completed ? 'text-success-dark' : 'text-charcoal'"
        >
          {{ challenge.title }}
        </div>
        <div v-if="challenge.target > 1" class="mt-1.5 flex items-center gap-2">
          <div class="h-1.5 flex-1 rounded-full bg-faded-gray/40 overflow-hidden">
            <div
              class="h-full rounded-full transition-[width] duration-700 ease-smooth"
              :class="challenge.completed ? 'bg-success' : 'bg-primary'"
              :style="{ width: `${(challenge.progress / challenge.target) * 100}%` }"
            ></div>
          </div>
          <span class="text-[10px] font-bold tabular-nums text-pencil-gray">
            {{ challenge.progress }}/{{ challenge.target
            }}{{ challenge.unit ? ` ${challenge.unit}` : "" }}
          </span>
        </div>
      </div>

      <button
        v-if="challenge.action && !challenge.completed"
        type="button"
        class="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border-2 border-primary px-2.5 py-1 text-xs font-extrabold text-primary transition-[background-color,color,scale] duration-200 ease-spring hover:bg-primary hover:text-white active:scale-95"
        @click="play(challenge.action)"
      >
        Jugar
        <ArrowRightIcon class="w-3.5 h-3.5" />
      </button>
    </li>
  </ul>
</template>

<script setup>
import { useRouter } from "vue-router";
import { CheckIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";
import { ACHIEVEMENT_ICONS } from "@/features/history/achievementPresentation";
import { useConfigStore } from "@/features/typing-test/store";

defineProps({
  // Output of buildDailyChallenges
  challenges: { type: Array, required: true },
});

const emit = defineEmits(["play"]);

const router = useRouter();
const configStore = useConfigStore();

const play = (action) => {
  if (configStore.type !== action.mode) configStore.handleType(action.mode);
  emit("play");
  router.push("/");
};
</script>
