<template>
  <!--
    "Tus dedos": the two hands, each finger with how often it misses and how
    fast it goes on your keyboard, which way it's heading, and the one to
    work on -- with a way straight into practicing it.
  -->
  <div>
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.fingers.title") }}
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{
          t(
            "history.view.lastSessions",
            Math.min(results.length, RECENT_INSIGHT_SESSIONS)
          )
        }}
      </div>
    </div>

    <div class="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
      <div
        v-for="hand in hands"
        :key="hand.id"
        role="group"
        :aria-label="t(`typing.fingerPicker.${hand.id}`)"
        class="flex flex-col items-center gap-2"
      >
        <div class="flex items-end gap-1.5 sm:gap-2">
          <div
            v-for="stat in hand.stats"
            :key="stat.finger"
            class="flex flex-col items-center gap-1"
          >
            <!-- Flagged: the one that misses, the one that lags -->
            <span
              class="h-4 text-[10px] font-extrabold uppercase tracking-wide"
              :class="flagOf(stat.finger)?.tone"
              >{{ flagOf(stat.finger)?.label }}</span
            >
            <div
              class="flex w-11 sm:w-12 flex-col items-center justify-start gap-0.5 rounded-t-full rounded-b-xl border-2 pt-4"
              :class="[HEIGHTS[FINGERS[stat.finger].kind], ringOf(stat.finger)]"
              :style="fingerStyle(stat.finger)"
              :aria-label="ariaFor(stat)"
              role="img"
            >
              <span class="text-sm font-extrabold tabular-nums text-charcoal">{{
                stat.measured ? percent(stat.rate) : "—"
              }}</span>
              <span class="text-[10px] font-bold tabular-nums text-pencil-gray">{{
                stat.timedEnough ? `${stat.meanMs} ms` : ""
              }}</span>
              <!-- Lately, against the sessions before -->
              <span
                v-if="trends?.[stat.finger]"
                class="mt-auto mb-2 flex items-center text-[10px] font-extrabold"
                :class="
                  trends[stat.finger].change < 0 ? 'text-success-dark' : 'text-danger'
                "
              >
                <component
                  :is="trends[stat.finger].change < 0 ? ArrowDownIcon : ArrowUpIcon"
                  class="h-3 w-3"
                />{{ points(trends[stat.finger].change) }}
              </span>
            </div>
            <span class="text-[10px] font-bold text-pencil-gray">{{
              t(`typing.fingerPicker.short.${FINGERS[stat.finger].kind}`)
            }}</span>
          </div>
        </div>
        <span class="text-[11px] font-bold text-pencil-gray">
          {{ t(`typing.fingerPicker.${hand.id}`) }}
        </span>
      </div>
    </div>

    <p class="mt-4 text-center text-[11px] font-bold text-pencil-gray">
      {{ t("history.fingers.legend") }}
    </p>

    <!-- The one to work on, and the way in -->
    <div
      v-if="focus"
      class="mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary-tint/30 px-4 py-3 sm:flex-row"
    >
      <p class="flex-1 text-sm font-bold text-charcoal">{{ focus.text }}</p>
      <button
        type="button"
        class="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold text-white border-b-2 border-primary-dark transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
        @click="practice(focus.finger)"
      >
        <HandRaisedIcon class="h-4 w-4" />
        {{ t("history.fingers.practice", focus.name) }}
      </button>
    </div>
    <p
      v-else-if="stats.hasData"
      class="mt-4 text-center text-sm font-bold text-success-dark"
    >
      {{ t("history.fingers.even") }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowDownIcon, ArrowUpIcon, HandRaisedIcon } from "@heroicons/vue/24/outline";
import { t } from "@/shared/i18n";
import { useConfigStore } from "@/features/typing-test/store";
import { FINGERS, fingerRgb } from "@/features/typing-test/utils/keyboardMap";
import { FINGER_IDS } from "@/features/typing-test/content/fingers";
import {
  computeFingerStats,
  computeFingerTrends,
} from "@/features/history/utils/fingerStats";
import { RECENT_INSIGHT_SESSIONS } from "@/features/history/utils/historyStats";

const props = defineProps({
  // The history being looked at, most recent first
  results: { type: Array, required: true },
});

const configStore = useConfigStore();
const router = useRouter();

const stats = computed(() =>
  computeFingerStats(props.results, configStore.keyboardLayout)
);
const trends = computed(() =>
  computeFingerTrends(props.results, configStore.keyboardLayout)
);

const byFinger = computed(
  () => new Map(stats.value.fingers.map((stat) => [stat.finger, stat]))
);
// Left hand pinky to index, right hand index to pinky, as on the keys
const HANDS_OF = [
  { id: "left", fingers: FINGER_IDS.slice(0, 4) },
  { id: "right", fingers: FINGER_IDS.slice(4) },
];
const hands = computed(() =>
  HANDS_OF.map((hand) => ({
    id: hand.id,
    stats: hand.fingers.map((id) => byFinger.value.get(id)),
  }))
);
const HEIGHTS = {
  pinky: "h-24",
  ring: "h-28",
  middle: "h-32",
  index: "h-28",
};

// A finger that almost never misses reads "<1%", not a flat "0%"
const percent = (rate) =>
  rate > 0 && rate < 0.005 ? "<1%" : `${Math.round(rate * 100)}%`;
const points = (change) => `${Math.abs(Math.round(change * 100))}`;

const flagOf = (finger) => {
  if (stats.value.weakest?.finger === finger) {
    return { label: t("history.fingers.weakest"), tone: "text-danger" };
  }
  if (stats.value.slowest?.finger === finger) {
    return { label: t("history.fingers.slowest"), tone: "text-primary" };
  }
  return null;
};
const ringOf = (finger) =>
  stats.value.weakest?.finger === finger
    ? "ring-2 ring-danger ring-offset-2 ring-offset-paper-white"
    : stats.value.slowest?.finger === finger
      ? "ring-2 ring-primary ring-offset-2 ring-offset-paper-white"
      : "";

const fingerStyle = (finger) => {
  const [r, g, b] = fingerRgb(finger);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.6)`,
  };
};

const ariaFor = (stat) =>
  [
    FINGERS[stat.finger].name,
    stat.measured
      ? t("history.fingers.ariaRate", percent(stat.rate))
      : t("history.fingers.ariaNoData"),
    stat.timedEnough ? t("history.fingers.ariaSpeed", stat.meanMs) : null,
  ]
    .filter(Boolean)
    .join(". ");

// Missing comes before lagging: a slow finger that's right beats a fast
// one that's wrong
const focus = computed(() => {
  const { weakest, slowest } = stats.value;
  if (weakest) {
    return {
      finger: weakest.finger,
      name: FINGERS[weakest.finger].name,
      text: t(
        "history.fingers.weakText",
        FINGERS[weakest.finger].name,
        percent(weakest.rate),
        weakest.typical < 0.005
          ? t("history.fingers.underOne")
          : t("history.fingers.typicalRate", percent(weakest.typical))
      ),
    };
  }
  if (slowest) {
    return {
      finger: slowest.finger,
      name: FINGERS[slowest.finger].name,
      text: t(
        "history.fingers.slowText",
        FINGERS[slowest.finger].name,
        slowest.meanMs,
        slowest.typical
      ),
    };
  }
  return null;
});

// Straight into "Dedos" with that finger alone
const practice = (finger) => {
  configStore.handleFingers([finger]);
  if (configStore.type !== "fingers") configStore.handleType("fingers");
  router.push("/");
};
</script>
