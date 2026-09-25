<template>
  <section class="relative px-4 py-16 sm:px-6 sm:py-24">
    <div class="mx-auto max-w-6xl">
      <header class="mx-auto mb-14 max-w-2xl text-center">
        <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
          {{ t("landing.showcase.stats.kicker") }}
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
        >
          {{ t("landing.showcase.stats.title") }}
        </h2>
        <p v-reveal="{ delay: 200 }" class="mt-4 text-base font-bold text-pencil-gray">
          {{ t("landing.showcase.stats.intro") }}
        </p>
      </header>

      <div class="space-y-20 sm:space-y-28">
        <div
          v-for="(row, index) in ROWS"
          :key="row.title"
          class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div
            v-reveal="{ variant: index % 2 ? 'slide-right' : 'slide-left' }"
            class="min-w-0"
            :class="{ 'lg:order-2': index % 2 }"
          >
            <p class="text-xs font-extrabold uppercase tracking-widest text-primary">
              {{ row.kicker }}
            </p>
            <h3 class="mt-2 font-display text-2xl font-black text-charcoal sm:text-3xl">
              {{ row.title }}
            </h3>
            <p class="mt-3 text-base font-bold text-pencil-gray">{{ row.text }}</p>
            <ul class="mt-4 space-y-2">
              <li
                v-for="point in row.points"
                :key="point"
                class="flex items-start gap-2 text-sm font-bold text-charcoal"
              >
                <CheckCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                {{ point }}
              </li>
            </ul>
          </div>

          <div
            v-reveal="{ variant: 'zoom', delay: 120 }"
            v-tilt="2"
            class="min-w-0 rounded-card border-2 border-faded-gray bg-paper-white p-5 shadow-xl shadow-primary/5 sm:p-6"
          >
            <InView :min-height="row.height">
              <!-- Keys missed -->
              <template v-if="row.id === 'keys'">
                <KeyErrorHeatmap :stats="demoKeyStats" />
              </template>

              <!-- How the keys are going -->
              <KeyTrendCard v-else-if="row.id === 'trends'" :trends="demoKeyTrends" />

              <!-- Day to day -->
              <DayConsistencyCard
                v-else-if="row.id === 'steady'"
                :data="demoDayConsistency"
              />

              <!-- Keys and transitions that hold you up -->
              <div v-else-if="row.id === 'slow'" class="space-y-6">
                <TimingBars
                  :stats="demoKeyTiming"
                  :title="t('landing.showcase.stats.slowKeys')"
                />
                <TimingBars
                  :stats="demoBigramTiming"
                  :title="t('landing.showcase.stats.slowCombos')"
                  :unit-label="t('landing.showcase.stats.comboUnit')"
                />
              </div>

              <!-- A session, second by second -->
              <div v-else-if="row.id === 'session'">
                <WpmChart :history="demoWpmHistory" />
                <div class="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span
                    v-for="chip in SESSION_CHIPS"
                    :key="chip"
                    class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal animate-pop-in"
                    >{{ chip }}</span
                  >
                </div>
              </div>

              <!-- Patterns -->
              <div v-else-if="row.id === 'patterns'" class="space-y-3">
                <div
                  v-for="(pattern, i) in PATTERNS"
                  :key="pattern.title"
                  class="flex items-start gap-3 rounded-xl bg-primary-tint/40 px-3 py-3 animate-rise"
                  :style="staggerStyle(i, { step: 90, base: 100 })"
                >
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white"
                  >
                    <component :is="pattern.icon" class="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div class="text-sm font-extrabold text-charcoal">
                      {{ pattern.title }}
                    </div>
                    <div class="text-xs font-bold text-pencil-gray">
                      {{ pattern.detail }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <span
                    v-for="(word, i) in demoProblemWords"
                    :key="word.word"
                    class="inline-flex items-baseline gap-2 rounded-xl border-2 border-danger/25 bg-danger-tint/50 px-3 py-1.5 animate-pop-in"
                    :style="staggerStyle(i, { step: 80, base: 400 })"
                  >
                    <span class="font-mono text-sm font-extrabold text-danger">{{
                      word.word
                    }}</span>
                    <span class="text-[11px] font-bold text-pencil-gray">{{
                      word.reason
                    }}</span>
                  </span>
                </div>
              </div>

              <!-- Habits -->
              <div v-else-if="row.id === 'habits'" class="space-y-6">
                <ActivityCalendar :activity="demoActivity" />
                <TimeOfDayCard :data="demoTimeOfDay" />
              </div>
            </InView>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  CheckCircleIcon,
  ArrowsPointingInIcon,
  ArrowPathRoundedSquareIcon,
  HandRaisedIcon,
} from "@heroicons/vue/24/outline";
import { staggerStyle } from "@/shared/utils/motion";
import { t } from "@/shared/i18n";
import KeyErrorHeatmap from "@/features/history/components/KeyErrorHeatmap.vue";
import TimingBars from "@/features/history/components/TimingBars.vue";
import KeyTrendCard from "@/features/history/components/KeyTrendCard.vue";
import DayConsistencyCard from "@/features/history/components/DayConsistencyCard.vue";
import ActivityCalendar from "@/features/history/components/ActivityCalendar.vue";
import TimeOfDayCard from "@/features/history/components/TimeOfDayCard.vue";
import WpmChart from "@/features/typing-test/components/WpmChart.vue";
import InView from "./InView.vue";
import {
  demoKeyStats,
  demoKeyTiming,
  demoBigramTiming,
  demoWpmHistory,
  demoActivity,
  demoTimeOfDay,
  demoProblemWords,
  demoKeyTrends,
  demoDayConsistency,
} from "../demoData";

const ROW_HEIGHTS = {
  keys: "18rem",
  trends: "10rem",
  slow: "20rem",
  session: "16rem",
  patterns: "18rem",
  steady: "14rem",
  habits: "18rem",
};

// Rebuilt when the language changes
const ROWS = computed(() =>
  Object.entries(ROW_HEIGHTS).map(([id, height]) => ({
    id,
    height,
    ...t(`landing.showcase.stats.rows.${id}`),
  }))
);

const SESSION_CHIPS = computed(() => t("landing.showcase.stats.sessionChips"));

const PATTERN_ICONS = [ArrowsPointingInIcon, ArrowPathRoundedSquareIcon, HandRaisedIcon];
const PATTERNS = computed(() =>
  t("landing.showcase.stats.patterns").map((pattern, i) => ({
    ...pattern,
    icon: PATTERN_ICONS[i],
  }))
);
</script>
