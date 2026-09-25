<template>
  <!-- Every letter in review: how it went from where it started to now,
       how far along the intervals it is, and when it's back -->
  <ul class="space-y-2">
    <li
      v-for="entry in entries"
      :key="entry.key"
      class="flex items-center gap-3 rounded-xl border-2 px-3 py-2"
      :class="
        entry.mastered ? 'border-success/40 bg-success-tint/40' : 'border-faded-gray'
      "
    >
      <kbd
        class="w-9 flex-shrink-0 rounded-md border-2 py-0.5 text-center font-mono text-sm font-extrabold uppercase"
        :class="
          entry.mastered
            ? 'border-success/40 text-success-dark'
            : 'border-primary/30 bg-primary-tint text-primary'
        "
        >{{ entry.key }}</kbd
      >

      <div class="min-w-0 flex-1">
        <div class="text-sm font-extrabold tabular-nums text-charcoal">
          {{ percent(entry.baselineRate) }}
          <span class="text-pencil-gray">→</span>
          <span
            :class="
              entry.lastRate < entry.baselineRate
                ? 'text-success'
                : entry.lastRate > entry.baselineRate
                  ? 'text-danger'
                  : ''
            "
            >{{ percent(entry.lastRate) }}</span
          >
          <span class="ml-1 text-[10px] font-bold uppercase text-pencil-gray">{{
            t("history.review.ofError")
          }}</span>
        </div>
        <!-- One dot per interval: the ones already held are filled -->
        <div
          class="mt-1 flex gap-1"
          :aria-label="`Paso ${entry.step + 1} de ${INTERVALS}`"
        >
          <span
            v-for="i in INTERVALS"
            :key="i"
            class="h-1.5 w-5 rounded-full"
            :class="
              entry.mastered || i <= entry.step
                ? 'bg-success'
                : i === entry.step + 1
                  ? 'bg-primary'
                  : 'bg-faded-gray/40'
            "
          ></span>
        </div>
      </div>

      <div class="flex-shrink-0 text-right text-xs font-bold">
        <span v-if="entry.mastered" class="text-success-dark">{{
          t("history.review.mastered")
        }}</span>
        <span v-else-if="entry.dueInDays <= 0" class="text-primary">{{
          t("history.review.today")
        }}</span>
        <span v-else class="text-pencil-gray">
          {{ t("history.review.due", entry.dueInDays) }}
        </span>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { REVIEW_INTERVALS } from "@/features/history/utils/keyReview";

defineProps({
  // listReviewKeys
  entries: { type: Array, required: true },
});

const INTERVALS = REVIEW_INTERVALS.length;

const percent = (rate) => `${Math.round(rate * 100)}%`;
</script>
