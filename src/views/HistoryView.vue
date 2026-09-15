<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-charcoal mb-6">
      Historial
    </h1>

    <div
      v-if="historyStore.sessionsCount === 0"
      class="bg-paper-white rounded-card p-8 border-2 border-faded-gray text-center text-pencil-gray"
    >
      Todavía no completaste ningún test.
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div
          class="bg-gradient-to-br from-primary-tint to-primary/10 rounded-card p-4 sm:p-6 border-2 border-primary text-center shadow-sm shadow-primary/20"
        >
          <div
            class="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-display font-extrabold text-primary-dark mb-1"
          >
            <FireIcon v-if="historyStore.dailyStreak > 0" class="w-5 h-5 sm:w-6 sm:h-6" />
            {{ historyStore.dailyStreak }}
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
            {{ historyStore.sessionsCount }}
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
            {{ historyStore.bestWpm }}
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
            {{ historyStore.averageWpm }}
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
            {{ historyStore.averageAccuracy }}%
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Precisión promedio
          </div>
        </div>
      </div>

      <!-- Trend -->
      <div
        v-if="trendValues.length >= 2"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6"
      >
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Tendencia de WPM
        </div>
        <TrendSparkline :values="trendValues" />
      </div>

      <!-- Personal bests -->
      <div v-if="historyStore.personalBests.length" class="mb-6">
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
            class="bg-paper-white rounded-card px-4 py-3 border-2 border-faded-gray flex items-center gap-3"
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

      <!-- Achievements -->
      <div class="mb-6">
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
          class="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
          :class="
            showAllAchievements
              ? 'max-h-[3000px]'
              : 'max-h-[560px] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]'
          "
        >
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="achievement in historyStore.achievements"
              :key="achievement.id"
              class="group relative rounded-card p-3 border-2 flex items-center gap-2.5 transition-all duration-300 ease-out"
              :class="
                achievement.unlocked
                  ? ''
                  : 'bg-faded-gray/10 border-faded-gray opacity-40'
              "
              :style="achievementStyle(achievement)"
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
                class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-xl bg-night-ink px-3 py-2 text-center text-xs font-bold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
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

      <!-- Sessions list -->
      <TransitionGroup
        tag="div"
        class="space-y-2 mb-6"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-x-4"
        move-class="transition-transform duration-300 ease-out"
      >
        <div
          v-for="result in historyStore.results"
          :key="result.id"
          class="bg-paper-white rounded-card p-3 sm:p-4 border-2 border-faded-gray flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <div class="font-bold text-charcoal truncate">
              {{ formatModeLabel(result) }}
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

      <div class="text-center">
        <ButtonCustom
          :text="confirmingClear ? '¿Confirmar borrado?' : 'Borrar historial'"
          variant="secondary"
          size="sm"
          @click="handleClearClick"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { FireIcon } from "@heroicons/vue/24/outline";
import ButtonCustom from "@/shared/components/ButtonCustom.vue";
import TrendSparkline from "@/features/history/components/TrendSparkline.vue";
import { useHistoryStore } from "@/features/history/store";
import { formatModeLabel as formatModeLabelUtil } from "@/features/history/utils/historyStats";
import {
  ACHIEVEMENT_ICONS as achievementIcons,
  achievementTintStyle as achievementStyle,
} from "@/features/history/achievementPresentation";

const historyStore = useHistoryStore();

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
  historyStore.results
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
  clearTimeout(confirmTimeout);
});
</script>
