<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <div class="flex items-center justify-between gap-3 mb-6 animate-rise">
      <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-charcoal">
        Historial
      </h1>
      <div class="hidden sm:flex items-center gap-2 text-xs text-pencil-gray font-bold">
        <kbd
          class="px-2 py-0.5 bg-paper-white text-charcoal rounded-md font-mono border-2 border-faded-gray"
          >ESPACIO</kbd
        >
        para volver a escribir
      </div>
    </div>

    <div
      v-if="historyStore.sessionsCount === 0"
      class="bg-paper-white rounded-card p-8 border-2 border-faded-gray text-center text-pencil-gray animate-rise [animation-delay:100ms]"
    >
      Todavía no completaste ningún test.
    </div>

    <template v-else>
      <div
        class="bg-paper-white rounded-card p-4 sm:p-5 border-2 border-faded-gray mb-6 animate-rise"
      >
        <XpProgress />

        <div class="text-center mt-3">
          <button
            type="button"
            class="text-xs font-bold text-primary hover:text-primary-dark"
            :aria-expanded="showLevels"
            @click="showLevels = !showLevels"
          >
            {{ showLevels ? "Ocultar niveles" : "Ver todos los niveles" }}
          </button>
        </div>
        <Transition
          enter-active-class="transition-[opacity,translate] duration-300 ease-smooth"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-opacity duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <!-- pt makes room for the "Estás acá" tag sticking out the top -->
          <div v-if="showLevels" class="pt-5">
            <LevelRoadmap />
          </div>
        </Transition>
      </div>

      <!-- Which mode the numbers below are about -->
      <div
        v-if="availableModes.length > 1"
        class="flex flex-wrap items-center gap-1.5 mb-4 animate-rise"
      >
        <IconButton
          :variant="selectedMode === null ? 'primary' : 'secondary'"
          size="xs"
          text="Todos"
          @click="selectedMode = null"
        />
        <IconButton
          v-for="mode in availableModes"
          :key="mode"
          :value="mode"
          :variant="selectedMode === mode ? 'primary' : 'secondary'"
          size="xs"
          :text="modeName(mode)"
          @click="selectedMode = mode"
        />
      </div>

      <!-- Summary cards -->
      <div
        class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 [&>*]:animate-rise [&>*:nth-child(2)]:[animation-delay:50ms] [&>*:nth-child(3)]:[animation-delay:100ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:200ms]"
      >
        <div
          class="bg-gradient-to-br from-primary-tint to-primary/10 rounded-card p-4 sm:p-6 border-2 border-primary text-center shadow-sm shadow-primary/20"
        >
          <div
            class="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-display font-extrabold text-primary-dark mb-1"
          >
            <FireIcon
              v-if="historyStore.dailyStreak > 0"
              class="w-5 h-5 sm:w-6 sm:h-6 animate-pop-in [animation-delay:500ms]"
            />
            <AnimatedNumber :value="historyStore.dailyStreak" />
          </div>
          <div
            class="text-xs sm:text-sm text-primary-dark font-bold uppercase tracking-wide"
          >
            Racha
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            <AnimatedNumber :value="summary.sessions" />
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Sesiones
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            <AnimatedNumber v-if="hasCurrent" :value="summary.bestWpm" />
            <template v-else>—</template>
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Mejor WPM
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            <AnimatedNumber v-if="hasCurrent" :value="summary.averageWpm" />
            <template v-else>—</template>
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            WPM promedio
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            <template v-if="hasCurrent">
              <AnimatedNumber :value="summary.averageAccuracy" />%
            </template>
            <template v-else>—</template>
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Precisión promedio
          </div>
        </div>
      </div>

      <!-- Today's challenges: for the whole day, whatever the filter says -->
      <div
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:220ms]"
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            Retos de hoy
          </div>
          <div
            class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
          >
            {{ historyStore.challengeStats.completed }}
            {{ historyStore.challengeStats.completed === 1 ? "cumplido" : "cumplidos" }} ·
            {{ historyStore.challengeStats.fullDays }}
            {{
              historyStore.challengeStats.fullDays === 1 ? "día redondo" : "días redondos"
            }}
          </div>
        </div>
        <ReviewToday v-if="historyStore.reviewToday.keys.length" class="mb-2" />
        <DailyChallengesList :challenges="historyStore.dailyChallenges" />
        <WeeklyChallengeCard class="mt-2" />

        <!-- Past weeks of the shared text, for comparing with a friend's -->
        <div v-if="pastWeeklyChallenges.length" class="mt-4">
          <div
            class="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
          >
            Semanas anteriores
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="week in pastWeeklyChallenges"
              :key="week.key"
              class="flex items-center gap-2 rounded-xl border-2 border-faded-gray px-3 py-1.5"
            >
              <span class="font-display font-extrabold text-charcoal">{{
                week.best.wpm
              }}</span>
              <span class="text-xs font-bold text-pencil-gray">{{
                weeklyLabel(week.key)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly goal, with the picker for it -->
      <div
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:240ms]"
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            Meta semanal
          </div>
          <div
            v-if="historyStore.weeksCompleted"
            class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
          >
            {{ historyStore.weeksCompleted }}
            {{
              historyStore.weeksCompleted === 1 ? "semana cumplida" : "semanas cumplidas"
            }}
          </div>
        </div>
        <WeeklyGoal editable />
      </div>

      <!-- Totals / per-keystroke stats -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div
          v-for="(stat, index) in extraStats"
          :key="stat.label"
          class="bg-paper-white rounded-card p-3 sm:p-4 border-2 border-faded-gray text-center animate-rise"
          :style="staggerStyle(index, { step: 50, base: 250 })"
        >
          <div class="text-xl sm:text-2xl font-display font-extrabold text-charcoal mb-1">
            <AnimatedNumber
              v-if="typeof stat.value === 'number'"
              :value="stat.value"
              :format="formatThousands"
            />
            <template v-else>{{ stat.value }}</template>
          </div>
          <div
            class="text-[10px] sm:text-xs text-pencil-gray font-bold uppercase tracking-wide"
          >
            {{ stat.label }}
          </div>
        </div>
      </div>

      <!-- Consistency, on the whole history: what you practised is what you
           practised, whatever mode it was in -->
      <div
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:400ms]"
      >
        <ActivityCalendar :activity="dailyActivity" />
      </div>

      <!-- Trend -->
      <div
        v-if="trendValues.length >= 2"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:450ms]"
      >
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Tendencia de WPM
        </div>
        <TrendSparkline :values="trendValues" />
      </div>

      <!-- Most-missed keys -->
      <div
        v-if="keyErrorStats.length"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:500ms]"
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            Teclas más falladas
          </div>
          <div
            class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
          >
            últimas {{ keyStatsResults.length }}
            {{ keyStatsResults.length === 1 ? "sesión" : "sesiones" }}
          </div>
        </div>
        <KeyErrorHeatmap :stats="keyErrorStats" />
        <ImprovementTips
          :stats="keyErrorStats"
          :average-accuracy="recentAccuracy"
          :confusions="confusionStats"
          :transpositions="transpositionStats"
          :key-timing="keyTimingStats"
          :bigram-timing="bigramTimingStats"
        />
      </div>

      <!-- Where the time goes: slow keys and slow transitions. Separate
           panel from the missed keys, because being slow on a key and
           getting it wrong are different problems. -->
      <div
        v-if="keyTimingStats.length || bigramTimingStats.length"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:520ms]"
      >
        <div class="space-y-6">
          <TimingBars
            v-if="keyTimingStats.length"
            :stats="keyTimingStats"
            title="Tus teclas más lentas"
          />
          <TimingBars
            v-if="bigramTimingStats.length"
            :stats="bigramTimingStats"
            title="Tus combinaciones más lentas"
            unit-label="combo"
          />
        </div>
      </div>

      <!-- Letters in spaced review -->
      <div
        v-if="historyStore.reviewKeys.length"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6 animate-rise [animation-delay:530ms]"
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            Letras en repaso
          </div>
          <div
            class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70"
          >
            1 · 3 · 7 · 14 · 30 días
          </div>
        </div>
        <ReviewKeysList :entries="historyStore.reviewKeys" />
      </div>

      <!-- Personal bests -->
      <div
        v-if="historyStore.personalBests.length"
        class="mb-6 animate-rise [animation-delay:550ms]"
      >
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Récords personales
        </div>
        <TransitionGroup
          tag="div"
          class="flex flex-wrap gap-2"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
          move-class="transition-transform duration-300 ease-out"
        >
          <div
            v-for="best in historyStore.personalBests"
            :key="`${best.mode}:${best.modeValue}`"
            class="bg-paper-white rounded-card px-4 py-3 border-2 border-faded-gray flex items-center gap-3 transition-[scale,border-color] duration-300 ease-spring hover:scale-105 hover:border-success"
          >
            <div class="font-display font-extrabold text-success text-lg">
              {{ best.wpm }}
            </div>
            <div class="text-xs text-pencil-gray font-bold">
              {{ formatModeLabel(best) }}
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Perfect rounds: kept apart from the history, so the count survives
           old sessions dropping off the end of it -->
      <div
        v-if="filteredPerfectRounds.length"
        class="mb-6 animate-rise [animation-delay:575ms]"
      >
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Rondas perfectas ({{ filteredPerfectTotal }})
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="entry in filteredPerfectRounds"
            :key="`${entry.mode}:${entry.modeValue}`"
            class="bg-paper-white rounded-card px-4 py-3 border-2 border-faded-gray flex items-center gap-3 transition-[scale,border-color] duration-300 ease-spring hover:scale-105 hover:border-success"
          >
            <div
              class="flex items-center gap-1 font-display font-extrabold text-success text-lg"
            >
              <SparklesIcon class="w-4 h-4" />
              {{ entry.count }}
            </div>
            <div class="text-xs text-pencil-gray font-bold">
              {{ formatModeLabel(entry) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="mb-6 animate-rise [animation-delay:600ms]">
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Logros ({{ historyStore.unlockedAchievementsCount }}/{{
            historyStore.achievements.length
          }})
        </div>

        <!-- Collapsed: clipped to ~2 rows with a fade at the bottom (same
             mask-image trick as the typing paragraph box) so a sliver of
             the next row peeks through as a hint there's more. All cards
             stay in the DOM either way — this only changes how much is
             visible, so expanding never re-fetches/re-renders anything. -->
        <div
          class="relative overflow-hidden transition-[max-height] duration-700 ease-smooth"
          :class="
            showAllAchievements
              ? 'max-h-[3000px]'
              : 'max-h-[560px] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]'
          "
        >
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="(achievement, index) in historyStore.achievements"
              :key="achievement.id"
              class="group relative rounded-card p-3 border-2 flex items-center gap-2.5 transition-[opacity,background-color,border-color,color,scale] duration-300 ease-spring hover:scale-[1.03] animate-pop-in"
              :style="{
                ...achievementStyle(achievement),
                ...staggerStyle(index, { step: 25, base: 650, max: 1200 }),
              }"
              :class="
                achievement.unlocked
                  ? ''
                  : 'bg-faded-gray/10 border-faded-gray opacity-40'
              "
            >
              <component
                :is="achievementIcons[achievement.icon]"
                class="w-5 h-5 flex-shrink-0"
                :class="achievement.unlocked ? '' : 'text-pencil-gray'"
              />
              <div class="min-w-0">
                <div
                  class="text-xs font-bold truncate"
                  :class="achievement.unlocked ? '' : 'text-pencil-gray'"
                >
                  {{ achievement.title }}
                </div>
                <div class="text-[10px] text-pencil-gray truncate">
                  {{ achievement.description }}
                </div>
              </div>

              <!-- Hover tooltip: the full "how to earn it" text, since the
                   line above truncates on smaller cards. -->
              <div
                class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 translate-y-1 rounded-xl bg-night-ink px-3 py-2 text-center text-xs font-bold text-white opacity-0 transition-[opacity,translate] duration-200 ease-smooth group-hover:translate-y-0 group-hover:opacity-100"
              >
                {{ achievement.description }}
                <div
                  class="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-night-ink"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="historyStore.achievements.length > ACHIEVEMENTS_COLLAPSED_COUNT"
          class="text-center mt-2"
        >
          <button
            type="button"
            class="text-xs font-bold text-primary hover:text-primary-dark"
            @click="showAllAchievements = !showAllAchievements"
          >
            {{
              showAllAchievements
                ? "Ver menos"
                : `Ver más (${historyStore.achievements.length - ACHIEVEMENTS_COLLAPSED_COUNT})`
            }}
          </button>
        </div>
      </div>

      <!-- Sessions list. Capped and scrolled on its own so a long history
           doesn't bury the buttons underneath it; the extra right padding
           keeps the cards clear of the scrollbar, and the negative margin
           puts the block back where it would have sat. -->
      <TransitionGroup
        tag="div"
        class="space-y-2 mb-6 max-h-[32rem] overflow-y-auto overscroll-contain pr-2 -mr-2"
        enter-active-class="transition-all duration-500 ease-smooth"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-x-6"
        move-class="transition-transform duration-500 ease-smooth"
      >
        <div
          v-for="(result, index) in filteredResults"
          :key="result.id"
          class="bg-paper-white rounded-card p-3 sm:p-4 border-2 border-faded-gray flex items-center justify-between gap-3 animate-rise transition-[border-color,translate] duration-300 ease-smooth hover:border-primary/50 hover:-translate-y-0.5"
          :style="staggerStyle(index, { step: 40, base: 700, max: 1100 })"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 font-bold text-charcoal min-w-0">
              <span class="truncate">{{ formatModeLabel(result) }}</span>
              <span
                v-if="!isCurrentMetrics(result)"
                class="flex-shrink-0 rounded-md border border-faded-gray px-1 text-[10px] text-pencil-gray"
                title="Medida con la fórmula anterior de WPM: no cuenta para récords ni promedios"
                >v1</span
              >
            </div>
            <div class="text-xs text-pencil-gray">{{ formatDate(result.date) }}</div>
          </div>
          <div class="flex items-center gap-4 flex-shrink-0 text-right">
            <div>
              <div class="font-display font-extrabold text-success">{{ result.wpm }}</div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">wpm</div>
            </div>
            <div>
              <div class="font-display font-extrabold text-charcoal">
                {{ result.accuracy }}%
              </div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">
                precisión
              </div>
            </div>
            <div>
              <div class="font-display font-extrabold text-charcoal">
                {{ result.errors }}
              </div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">errores</div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <ButtonCustom
          text="Exportar"
          variant="secondary"
          size="sm"
          @click="handleExport"
        />
        <ButtonCustom
          text="Importar"
          variant="secondary"
          size="sm"
          @click="fileInput?.click()"
        />
        <ButtonCustom
          :text="confirmingClear ? '¿Confirmar borrado?' : 'Borrar historial'"
          variant="secondary"
          size="sm"
          @click="handleClearClick"
        />
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="handleImport"
        />
      </div>

      <p
        v-if="backupMessage"
        class="mt-3 text-center text-sm font-bold"
        :class="backupFailed ? 'text-danger' : 'text-success'"
      >
        {{ backupMessage }}
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { FireIcon, SparklesIcon } from "@heroicons/vue/24/outline";
import ButtonCustom from "@/shared/components/ButtonCustom.vue";
import IconButton from "@/shared/components/IconButton.vue";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import { staggerStyle } from "@/shared/utils/motion";
import TrendSparkline from "@/features/history/components/TrendSparkline.vue";
import KeyErrorHeatmap from "@/features/history/components/KeyErrorHeatmap.vue";
import ImprovementTips from "@/features/history/components/ImprovementTips.vue";
import TimingBars from "@/features/history/components/TimingBars.vue";
import ActivityCalendar from "@/features/history/components/ActivityCalendar.vue";
import DailyChallengesList from "@/features/history/components/DailyChallengesList.vue";
import XpProgress from "@/features/history/components/XpProgress.vue";
import WeeklyGoal from "@/features/history/components/WeeklyGoal.vue";
import WeeklyChallengeCard from "@/features/history/components/WeeklyChallengeCard.vue";
import { weeklyKey, weeklyLabel } from "@/features/typing-test/content/weekly";
import ReviewToday from "@/features/history/components/ReviewToday.vue";
import ReviewKeysList from "@/features/history/components/ReviewKeysList.vue";
import LevelRoadmap from "@/features/history/components/LevelRoadmap.vue";
import { useHistoryStore } from "@/features/history/store";
import {
  buildBackup,
  parseBackup,
  backupFilename,
} from "@/features/history/utils/historyBackup";
import {
  formatModeLabel as formatModeLabelUtil,
  formatModeName,
  computeBestStreak,
  computeTotalTimeElapsed,
  computeTotalKeystrokes,
  computeTotalCorrectedErrors,
  computeKeyErrorStats,
  computeConfusionStats,
  computeTranspositionStats,
  computeKeyTimingStats,
  computeBigramTimingStats,
  RECENT_INSIGHT_SESSIONS,
  computeDailyActivity,
  computeAverageAccuracy,
  computeAverageConsistency,
  computeAverageWpm,
  computeBestWpm,
  isCurrentMetrics,
} from "@/features/history/utils/historyStats";
import {
  ACHIEVEMENT_ICONS as achievementIcons,
  achievementTintStyle as achievementStyle,
} from "@/features/history/achievementPresentation";

const historyStore = useHistoryStore();
const router = useRouter();

// Space jumps straight back to typing — same key that restarts a finished
// test, so muscle memory works from here too. Skipped while a text field
// has focus so it never swallows real typing.
const handleKeydown = (event) => {
  if (event.key !== " " || event.repeat) return;
  const target = event.target;
  if (target?.closest?.("input, textarea, select, [contenteditable='true']")) return;

  event.preventDefault();
  router.push("/");
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  historyStore.refreshDay();
});

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m`;
  return `${seconds}s`;
};

// Which mode the page is looking at (null = all of them). A 15-second test
// and a Python snippet are different exercises, so pooling them into one
// average makes the average mean nothing.
const selectedMode = ref(null);

// Just the mode, since the chip covers every length at once
const modeName = formatModeName;

const availableModes = computed(() => [
  ...new Set(historyStore.results.map((result) => result.mode)),
]);

const filteredResults = computed(() =>
  selectedMode.value
    ? historyStore.results.filter((result) => result.mode === selectedMode.value)
    : historyStore.results
);

// Sessions measured with the current formula, within the current filter --
// the same distinction the store makes, narrowed down.
const filteredCurrent = computed(() => filteredResults.value.filter(isCurrentMetrics));

const summary = computed(() => ({
  sessions: filteredResults.value.length,
  bestWpm: computeBestWpm(filteredCurrent.value),
  averageWpm: computeAverageWpm(filteredCurrent.value),
  averageAccuracy: computeAverageAccuracy(filteredCurrent.value),
}));

const extraStats = computed(() => {
  const results = filteredResults.value;
  const corrected = computeTotalCorrectedErrors(results);
  const keystrokes = computeTotalKeystrokes(results);
  // Recent habits, like the accuracy tips: how steady you type now
  const consistency = computeAverageConsistency(results.slice(0, RECENT_SESSIONS));
  return [
    { label: "Mejor combo", value: computeBestStreak(results) || "—" },
    {
      label: "Consistencia",
      value: consistency === null ? "—" : `${consistency}%`,
    },
    { label: "Tiempo total", value: formatDuration(computeTotalTimeElapsed(results)) },
    {
      label: "Teclas pulsadas",
      value: keystrokes || "—",
    },
    {
      label: "Errores corregidos",
      value: corrected || "—",
    },
  ];
});

const formatThousands = (value) => value.toLocaleString("es");

const hasCurrent = computed(() => filteredCurrent.value.length > 0);

const showLevels = ref(false);

// This week has its own card; the list is for the ones before it
const pastWeeklyChallenges = computed(() => {
  const current = weeklyKey(historyStore.challengeDay);
  return historyStore.weeklyChallenges.filter((week) => week.key !== current);
});

const filteredPerfectRounds = computed(() =>
  selectedMode.value
    ? historyStore.perfectRoundsList.filter((entry) => entry.mode === selectedMode.value)
    : historyStore.perfectRoundsList
);
const filteredPerfectTotal = computed(() =>
  filteredPerfectRounds.value.reduce((sum, entry) => sum + entry.count, 0)
);

// Accuracy over the last few comparable sessions — recent habits matter more
// than old ones for "what to work on now".
const RECENT_SESSIONS = 10;
const recentAccuracy = computed(() => {
  const recent = filteredCurrent.value.slice(0, RECENT_SESSIONS);
  return recent.length ? computeAverageAccuracy(recent) : null;
});

// Per-key stats read a window of recent sessions rather than the whole
// stored history -- see RECENT_INSIGHT_SESSIONS. Wider than RECENT_SESSIONS,
// which is about comparing a handful of like sessions rather than volume.
const keyStatsResults = computed(() =>
  filteredResults.value.slice(0, RECENT_INSIGHT_SESSIONS)
);
// A full year, the way every contribution grid shows one. 365 days plus
// the padding of a first week that rarely starts on a Sunday comes to at
// most 53 columns; at 10px a cell with a 3px gap that's 717px, which fits
// this page's content width with three pixels to spare. A 54th column --
// which 371 days would produce -- pushes it into scrolling sideways.
const ACTIVITY_DAYS = 365;
const dailyActivity = computed(() =>
  computeDailyActivity(historyStore.results, { days: ACTIVITY_DAYS })
);

const keyErrorStats = computed(() => computeKeyErrorStats(keyStatsResults.value));
const confusionStats = computed(() => computeConfusionStats(keyStatsResults.value));
const transpositionStats = computed(() =>
  computeTranspositionStats(keyStatsResults.value)
);
const keyTimingStats = computed(() => computeKeyTimingStats(keyStatsResults.value));
const bigramTimingStats = computed(() => computeBigramTimingStats(keyStatsResults.value));

// Achievements grid starts collapsed to roughly this many cards' worth of
// height (~7 rows: on desktop's 3-col grid that's 21 cards, on mobile's
// 2-col grid the same height fits ~14) — only affects the label on the
// "ver más" button; the actual clipping is done with max-height/mask-image
// in the template so all cards stay mounted and toggling never re-renders
// them.
const ACHIEVEMENTS_COLLAPSED_COUNT = 21;
const showAllAchievements = ref(false);

// Trend chart reads chronologically (oldest -> newest); results are stored
// most-recent-first, so reverse the last 30 sessions.
const TREND_SESSIONS = 30;
const trendValues = computed(() =>
  filteredCurrent.value
    .slice(0, TREND_SESSIONS)
    .map((r) => r.wpm)
    .reverse()
);

const formatModeLabel = (result) => formatModeLabelUtil(result);

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });

// Two-step confirmation: the button asks to confirm, then reverts on its
// own after a few seconds if the user doesn't click again.
const confirmingClear = ref(false);
let confirmTimeout = null;

// Backup: a plain JSON file out, the same file back in. No confirm dialogs
// -- they freeze the page and there's nothing here worth interrupting for.
const fileInput = ref(null);
const backupMessage = ref("");
const backupFailed = ref(false);
let backupMessageTimeout = null;

const showBackupMessage = (message, { failed = false } = {}) => {
  backupMessage.value = message;
  backupFailed.value = failed;
  clearTimeout(backupMessageTimeout);
  backupMessageTimeout = setTimeout(() => {
    backupMessage.value = "";
  }, 6000);
};

const handleExport = () => {
  const blob = new Blob([JSON.stringify(buildBackup(historyStore.results), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFilename();
  link.click();
  URL.revokeObjectURL(url);

  const count = historyStore.results.length;
  showBackupMessage(`Exportaste ${count} ${count === 1 ? "sesión" : "sesiones"}.`);
};

const handleImport = async (event) => {
  const [file] = event.target.files ?? [];
  // Cleared right away so picking the same file twice in a row still fires
  event.target.value = "";
  if (!file) return;

  const parsed = parseBackup(await file.text());
  if (!parsed.ok) {
    showBackupMessage(parsed.error, { failed: true });
    return;
  }

  const { added } = historyStore.importResults(parsed.results);
  const skipped = parsed.skipped ? ` Se saltearon ${parsed.skipped} sin leer.` : "";
  showBackupMessage(
    added
      ? `Importaste ${added} ${added === 1 ? "sesión nueva" : "sesiones nuevas"}.${skipped}`
      : `Ya tenías todas esas sesiones.${skipped}`
  );
};

const handleClearClick = () => {
  if (!confirmingClear.value) {
    confirmingClear.value = true;
    confirmTimeout = setTimeout(() => {
      confirmingClear.value = false;
    }, 3000);
    return;
  }

  clearTimeout(confirmTimeout);
  confirmingClear.value = false;
  historyStore.clearHistory();
};

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  clearTimeout(confirmTimeout);
  clearTimeout(backupMessageTimeout);
});
</script>
