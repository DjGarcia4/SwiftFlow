<template>
  <!--
    After a drill round: whether to keep at these letters today, each one
    against its target for the day, and where it stands in review -- the
    answer to "¿paro o sigo?" that a drill otherwise never gives.
  -->
  <div class="rounded-card border-2 bg-paper-white px-4 py-3" :class="tone.border">
    <div class="mb-2.5 flex items-center gap-2">
      <component :is="tone.icon" class="w-5 h-5 flex-shrink-0" :class="tone.text" />
      <div class="min-w-0">
        <div class="text-sm font-extrabold" :class="tone.text">{{ headline }}</div>
        <div class="text-xs font-bold text-pencil-gray">{{ subline }}</div>
      </div>
    </div>

    <ul class="space-y-2">
      <li
        v-for="letter in readiness.letters"
        :key="letter.key"
        class="flex items-center gap-2.5"
      >
        <kbd
          class="w-8 flex-shrink-0 rounded-md border-2 py-0.5 text-center font-mono text-sm font-extrabold uppercase"
          :class="
            letter.ready
              ? 'border-success/40 bg-success-tint text-success-dark'
              : 'border-primary/30 bg-primary-tint text-primary'
          "
          >{{ letter.key }}</kbd
        >
        <div class="min-w-0 flex-1">
          <!-- The bar is the miss rate; the tick is the day's target -->
          <div class="relative h-2 rounded-full bg-faded-gray/40">
            <div
              class="h-full rounded-full transition-[width] duration-700 ease-smooth"
              :class="letter.ready ? 'bg-success' : 'bg-primary'"
              :style="{ width: `${barWidth(letter.latest)}%` }"
            ></div>
            <div
              class="absolute -top-1 h-4 w-0.5 rounded-full bg-charcoal"
              :style="{ left: `${barWidth(letter.target)}%` }"
              :title="t('typing.drillSummary.goalToday', percent(letter.target))"
            ></div>
          </div>
          <div
            class="mt-1 flex justify-between gap-2 text-[11px] font-bold text-pencil-gray"
          >
            <span>
              <span
                class="tabular-nums"
                :class="letter.ready ? 'text-success-dark' : 'text-charcoal'"
              >
                {{ letter.latest === null ? "—" : percent(letter.latest) }}
              </span>
              {{ t("typing.drillSummary.ofError") }} ·
              {{ t("typing.drillSummary.goal", percent(letter.target)) }}
              <template v-if="letter.attempts < MIN_DAY_ATTEMPTS">
                ·
                {{ t("typing.drillSummary.attempts", letter.attempts, MIN_DAY_ATTEMPTS) }}
              </template>
            </span>
            <span v-if="reviewLine(letter.key)" class="truncate">{{
              reviewLine(letter.key)
            }}</span>
          </div>
        </div>
      </li>
    </ul>

    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button
        v-if="readiness.verdict !== 'keep'"
        type="button"
        class="rounded-lg border-2 border-faded-gray px-3 py-1.5 text-xs font-extrabold text-pencil-gray transition-colors duration-200 hover:text-charcoal"
        @click="emit('again')"
      >
        {{ t("typing.drillSummary.sameAgain") }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white border-b-2 transition-[background-color,scale] duration-200 ease-spring active:scale-95"
        :class="
          readiness.verdict === 'keep'
            ? 'bg-primary border-primary-dark hover:bg-primary-dark'
            : 'bg-success border-success-dark hover:bg-success-dark'
        "
        @click="readiness.verdict === 'keep' ? emit('again') : emit('leave')"
      >
        {{
          readiness.verdict === "keep"
            ? t("typing.drillSummary.again")
            : t("typing.drillSummary.backTo", leaveLabel)
        }}
        <ArrowRightIcon class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MoonIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import { MIN_DAY_ATTEMPTS } from "@/features/history/utils/drillReadiness";

const props = defineProps({
  // computeDrillReadiness
  readiness: { type: Object, required: true },
  // applyDrillSession's changes for the round just played
  reviewChanges: { type: Array, default: () => [] },
  // Name of the mode to go back to
  leaveLabel: { type: String, default: "Tiempo" },
});

const emit = defineEmits(["again", "leave"]);

const TONES = {
  keep: { icon: ArrowPathIcon, text: "text-primary", border: "border-primary/40" },
  ready: {
    icon: CheckCircleIcon,
    text: "text-success-dark",
    border: "border-success/50",
  },
  rest: { icon: MoonIcon, text: "text-charcoal", border: "border-faded-gray" },
};
const tone = computed(() => TONES[props.readiness.verdict] ?? TONES.keep);

const headline = computed(() => {
  switch (props.readiness.verdict) {
    case "ready":
      return t("typing.drillSummary.ready");
    case "rest":
      return t("typing.drillSummary.rest");
    default:
      return t("typing.drillSummary.keep");
  }
});

const subline = computed(() => {
  const { verdict, rounds, pending, restReason } = props.readiness;
  const roundText = t("typing.drillSummary.rounds", rounds);
  if (verdict === "ready") return t("typing.drillSummary.readyDetail", roundText);
  if (verdict === "rest") {
    return restReason === "stalled"
      ? t("typing.drillSummary.stalled", roundText)
      : t("typing.drillSummary.enough", roundText);
  }
  return t(
    "typing.drillSummary.pending",
    roundText,
    pending.map((key) => key.toUpperCase())
  );
});

const percent = (rate) => `${Math.round(rate * 100)}%`;

// Rates are small numbers; half the bar is 30%, so the targets aren't all
// squashed against the left edge
const BAR_SCALE = 0.6;
const barWidth = (rate) => (rate === null ? 0 : Math.min(100, (rate / BAR_SCALE) * 100));

const reviewLine = (key) => {
  const change = props.reviewChanges.find((c) => c.key === key);
  if (!change) return "";
  if (change.mastered) return t("typing.drillSummary.mastered");
  return t("typing.drillSummary.review", change.nextInDays);
};
</script>
