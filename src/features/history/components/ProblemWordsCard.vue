<template>
  <div>
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.problemWords.title") }}
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border-2 border-primary px-2.5 py-1 text-xs font-extrabold text-primary transition-[background-color,color,scale] duration-200 ease-spring hover:bg-primary hover:text-white active:scale-95"
        @click="train"
      >
        {{ t("history.problemWords.train") }}
        <ArrowRightIcon class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <div
        v-for="(entry, index) in words"
        :key="entry.word"
        class="inline-flex items-baseline gap-2 rounded-xl border-2 border-danger/25 bg-danger-tint/50 px-3 py-1.5 animate-pop-in"
        :style="staggerStyle(index, { step: 40, base: 100 })"
      >
        <span class="font-mono text-sm font-extrabold text-danger">{{ entry.word }}</span>
        <span class="text-[11px] font-bold text-pencil-gray">{{ reason(entry) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { useRouter } from "vue-router";
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import { staggerStyle } from "@/shared/utils/motion";
import { useTrainWords } from "@/features/typing-test/utils/useTrainNow";
import { ERROR_RATE_BAR, SLOW_RATIO_BAR } from "@/features/history/utils/problemWords";

const props = defineProps({
  // computeProblemWords
  words: { type: Array, required: true },
});

const router = useRouter();
const trainWords = useTrainWords();

// What makes it a problem: getting it wrong, or taking long over it --
// whichever is the bigger part of the story
const reason = (entry) => {
  const errorShare = entry.errorRate / ERROR_RATE_BAR;
  const slowShare = entry.slowRatio / SLOW_RATIO_BAR;
  if (entry.errors && errorShare >= slowShare) {
    return t("history.problemWords.errors", entry.errors, entry.times);
  }
  return t("history.problemWords.slower", Math.round((entry.slowRatio - 1) * 100));
};

const train = () => {
  trainWords(props.words.map((entry) => entry.word));
  router.push("/");
};
</script>
