<template>
  <!-- This week's shared text: your best on it so far, and a way in -->
  <div
    class="flex items-center gap-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-3 py-2.5"
  >
    <div
      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white"
    >
      <TrophyIcon class="w-4.5 h-4.5" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="text-sm font-bold leading-snug text-charcoal">
        {{ t("history.weeklyCard.title", weeklyLabel(key)) }}
      </div>
      <div class="text-xs text-pencil-gray">
        <template v-if="week">
          {{ t("history.weeklyCard.yourBest") }}
          <span class="font-extrabold text-charcoal">{{ week.best.wpm }} wpm</span> ·
          {{ t("history.weeklyCard.attempts", week.attempts) }}
        </template>
        <template v-else>{{ t("history.weeklyCard.sameText") }}</template>
      </div>
    </div>

    <button
      type="button"
      class="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border-2 border-amber-500 px-2.5 py-1 text-xs font-extrabold text-amber-600 transition-[background-color,color,scale] duration-200 ease-spring hover:bg-amber-500 hover:text-white active:scale-95"
      @click="play"
    >
      {{ week ? t("history.weeklyCard.improve") : t("history.weeklyCard.play") }}
      <ArrowRightIcon class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { TrophyIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";
import { useHistoryStore } from "@/features/history/store";
import { useConfigStore } from "@/features/typing-test/store";
import { weeklyKey, weeklyLabel } from "@/features/typing-test/content/weekly";

const emit = defineEmits(["play"]);

const historyStore = useHistoryStore();
const configStore = useConfigStore();
const router = useRouter();

// The week the challenges are on, so it turns over with them
const key = computed(() => weeklyKey(historyStore.challengeDay));
const week = computed(() =>
  historyStore.weeklyChallengeFor(key.value, configStore.textLanguage)
);

const play = () => {
  if (configStore.type !== "weekly") configStore.handleType("weekly");
  emit("play");
  router.push("/");
};
</script>
