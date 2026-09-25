<template>
  <!-- The letters due for review today, with a one-click drill on the ones
       still pending -->
  <div
    class="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-[border-color,background-color] duration-300"
    :class="
      review.completed
        ? 'border-success/40 bg-success-tint/60'
        : 'border-primary/40 bg-primary-tint/40'
    "
  >
    <div
      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
      :class="review.completed ? 'bg-success text-white' : 'bg-primary text-white'"
    >
      <CheckIcon v-if="review.completed" class="w-4.5 h-4.5 animate-pop-in" />
      <ArrowPathRoundedSquareIcon v-else class="w-4.5 h-4.5" />
    </div>

    <div class="min-w-0 flex-1">
      <div
        class="text-sm font-bold leading-snug"
        :class="review.completed ? 'text-success-dark' : 'text-charcoal'"
      >
        {{
          review.completed ? t("history.review.doneToday") : t("history.review.dueToday")
        }}
      </div>
      <div class="mt-1 flex flex-wrap gap-1">
        <kbd
          v-for="key in review.keys"
          :key="key"
          class="rounded-md border-2 px-1.5 font-mono text-xs font-extrabold uppercase"
          :class="
            review.done.includes(key)
              ? 'border-success/40 text-success-dark line-through'
              : 'border-primary/40 bg-paper-white text-primary'
          "
          >{{ key }}</kbd
        >
      </div>
    </div>

    <button
      v-if="!review.completed"
      type="button"
      class="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-extrabold text-white border-b-2 border-primary-dark transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
      @click="startReview"
    >
      {{ t("history.review.start") }}
      <ArrowRightIcon class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowPathRoundedSquareIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import { useHistoryStore } from "@/features/history/store";
import { useTrainNow } from "@/features/typing-test/utils/useTrainNow";

const emit = defineEmits(["play"]);

const historyStore = useHistoryStore();
const review = computed(() => historyStore.reviewToday);
const trainNow = useTrainNow();
const router = useRouter();

// Only what's still pending: a letter already reviewed today would just be
// extra practice
const startReview = () => {
  trainNow(review.value.keys.filter((key) => !review.value.done.includes(key)));
  emit("play");
  router.push("/");
};
</script>
