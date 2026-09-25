<template>
  <!--
    "Tu resumen": a month or a year of practice, told as a handful of
    headline cards instead of a table, and shareable as an image.
  -->
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
    <div
      v-if="!periods.months.length"
      class="rounded-card border-2 border-faded-gray p-8 text-center text-pencil-gray"
    >
      {{ t("history.summary.page.empty") }}
    </div>

    <template v-else>
      <header class="mb-6 flex flex-wrap items-end justify-between gap-3 animate-rise">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-widest text-primary">
            {{ t("history.summary.page.kicker") }}
          </p>
          <h1 class="mt-1 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
            {{
              summary
                ? t("history.summary.page.title", summary.label)
                : t("history.summary.page.noSessions")
            }}
          </h1>
        </div>
        <label class="flex items-center gap-2 text-sm font-bold text-pencil-gray">
          {{ t("history.summary.page.period") }}
          <select
            :value="periodId(period)"
            class="cursor-pointer rounded-xl border-2 border-faded-gray bg-paper-white px-2.5 py-1.5 text-sm font-bold text-charcoal focus:border-primary focus:outline-none"
            @change="pickPeriod($event.target.value)"
          >
            <optgroup :label="t('history.summary.page.months')">
              <option
                v-for="month in periods.months"
                :key="periodId(month)"
                :value="periodId(month)"
              >
                {{ periodLabel(month) }}
              </option>
            </optgroup>
            <optgroup :label="t('history.summary.page.years')">
              <option
                v-for="year in periods.years"
                :key="periodId(year)"
                :value="periodId(year)"
              >
                {{ periodLabel(year) }}
              </option>
            </optgroup>
          </select>
        </label>
      </header>

      <p v-if="!summary" class="text-pencil-gray">
        {{ t("history.summary.page.nothingIn", periodLabel(period)) }}
      </p>

      <template v-else>
        <!-- How much -->
        <section class="mb-4 grid grid-cols-3 gap-3 animate-rise [animation-delay:60ms]">
          <div
            v-for="stat in amounts"
            :key="stat.label"
            class="rounded-card border-2 border-faded-gray bg-paper-white p-4 text-center"
          >
            <div class="font-display text-3xl font-black text-charcoal sm:text-5xl">
              <AnimatedNumber :value="stat.value" />
            </div>
            <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
              {{ stat.label }}
            </div>
            <div v-if="stat.detail" class="mt-0.5 text-[11px] font-bold text-pencil-gray">
              {{ stat.detail }}
            </div>
          </div>
        </section>

        <!-- The story -->
        <section class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="(card, index) in cards"
            :key="card.title"
            class="rounded-card border-2 bg-paper-white p-4 sm:p-5 animate-rise"
            :class="[
              card.highlight ? 'border-primary/50' : 'border-faded-gray',
              // An odd one out at the end takes the whole row
              { 'sm:col-span-2': index === cards.length - 1 && cards.length % 2 },
            ]"
            :style="{ animationDelay: `${120 + index * 70}ms` }"
          >
            <div
              class="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary"
            >
              <component :is="card.icon" class="h-4 w-4" />
              {{ card.title }}
            </div>
            <div class="font-display text-2xl font-black text-charcoal">
              {{ card.value }}
            </div>
            <div class="text-sm font-bold text-pencil-gray">{{ card.detail }}</div>
          </article>
        </section>

        <!-- What got unlocked -->
        <section
          v-if="summary.achievements.length"
          class="mt-4 rounded-card border-2 border-faded-gray bg-paper-white p-4 sm:p-5 animate-rise [animation-delay:500ms]"
        >
          <div class="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary">
            {{ summary.achievements.length }}
            {{ t("history.summary.page.newAchievements", summary.achievements.length) }}
          </div>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="achievement in summary.achievements"
              :key="achievement.id"
              class="inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1 text-sm font-extrabold"
              :style="achievementTintStyle(achievement)"
            >
              <component :is="ACHIEVEMENT_ICONS[achievement.icon]" class="h-4 w-4" />
              {{ achievement.title }}
            </li>
          </ul>
        </section>

        <div class="mt-6 flex justify-center">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-5 py-2.5 font-extrabold text-white transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
            @click="share"
          >
            <ShareIcon class="h-5 w-5" />
            {{ t("history.summary.page.share") }}
          </button>
        </div>
      </template>
    </template>

    <ShareResultModal
      :open="shareOpen"
      :image-url="imageUrl"
      :can-native-share="canNativeShare"
      :title="t('history.summary.page.shareTitle')"
      @close="closeShare"
      @download="download"
      @share="nativeShare"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BoltIcon,
  CheckBadgeIcon,
  KeyIcon,
  HeartIcon,
  FireIcon,
  CalendarDaysIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import ShareResultModal from "@/features/typing-test/components/ShareResultModal.vue";
import { useHistoryStore } from "@/features/history/store";
import {
  ACHIEVEMENT_ICONS,
  achievementTintStyle,
} from "@/features/history/achievementPresentation";
import { formatKeyLabel } from "@/features/history/utils/historyStats";
import {
  availablePeriods,
  computeSummary,
  periodId,
  periodLabel,
  parsePeriodId,
} from "@/features/history/utils/summary";
import { drawSummaryCard } from "@/features/history/utils/summaryCard";
import { t, localeTag } from "@/shared/i18n";

const P = "history.summary.page.";

const route = useRoute();
const router = useRouter();
const historyStore = useHistoryStore();

const periods = computed(() => availablePeriods(historyStore.results));

// The period in the URL (?periodo=2026-09), or the latest month played
const period = computed(
  () => parsePeriodId(route.query.periodo) ?? periods.value.months[0] ?? null
);
const pickPeriod = (id) => router.replace({ query: { periodo: id } });

const summary = computed(() =>
  period.value ? computeSummary(historyStore.results, period.value) : null
);

const amounts = computed(() => [
  {
    value: summary.value.sessions,
    label: t("history.summary.sessions", summary.value.sessions),
  },
  { value: summary.value.minutes, label: t("history.summary.minutes") },
  {
    value: summary.value.daysPracticed,
    label: t("history.summary.days", summary.value.daysPracticed),
    detail: t("history.summary.page.of", summary.value.daysSoFar),
  },
]);

const percent = (rate) => `${Math.round(rate * 100)}%`;
const formatDay = (date) =>
  new Date(date).toLocaleDateString(localeTag(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const cards = computed(() => {
  const s = summary.value;
  const list = [];
  if (s.best) {
    list.push({
      icon: BoltIcon,
      title: t(s.best.record ? `${P}record` : `${P}best`),
      value: `${s.best.wpm} wpm`,
      detail: s.best.record
        ? t(`${P}newRecordIn`, s.best.label)
        : t(`${P}inMode`, s.best.label),
      highlight: s.best.record,
    });
  }
  if (s.averageWpm !== null) {
    const change =
      s.wpmChange === null
        ? t(`${P}periodAverage`)
        : s.wpmChange > 0
          ? t(`${P}faster`, s.wpmChange)
          : s.wpmChange < 0
            ? t(`${P}slower`, Math.abs(s.wpmChange))
            : t(`${P}same`);
    list.push({
      icon: BoltIcon,
      title: t(`${P}averageSpeed`),
      value: `${s.averageWpm} wpm`,
      detail: change,
      highlight: s.wpmChange > 0,
    });
  }
  if (s.averageAccuracy !== null) {
    list.push({
      icon: CheckBadgeIcon,
      title: t(`${P}accuracy`),
      value: `${s.averageAccuracy}%`,
      detail: t(`${P}accuracyDetail`),
    });
  }
  if (s.tamedKey) {
    list.push({
      icon: KeyIcon,
      title: t(`${P}tamedKey`),
      value: formatKeyLabel(s.tamedKey.key).toUpperCase(),
      detail: t(`${P}tamedDetail`, percent(s.tamedKey.before), percent(s.tamedKey.after)),
      highlight: true,
    });
  }
  list.push({
    icon: HeartIcon,
    title: t(`${P}favoriteMode`),
    value: s.favoriteMode.name,
    detail: `${s.favoriteMode.sessions} ${t("history.summary.sessions", s.favoriteMode.sessions)}`,
  });
  list.push({
    icon: FireIcon,
    title: t(`${P}longestStreak`),
    value: `${s.longestStreak} ${t("history.summary.days", s.longestStreak)}`,
    detail: t(`${P}streakDetail`),
  });
  list.push({
    icon: CalendarDaysIcon,
    title: t(`${P}busiestDay`),
    value: `${s.busiestDay.sessions} ${t("history.summary.sessions", s.busiestDay.sessions)}`,
    detail: formatDay(s.busiestDay.date),
  });
  return list;
});

// Sharing: the image first, previewed, then downloaded or shared
const shareOpen = ref(false);
const imageUrl = ref(null);
const blob = ref(null);
const canNativeShare = ref(false);
const fileName = () => t(`${P}fileName`);

const share = () => {
  const canvas = drawSummaryCard(document.createElement("canvas"), summary.value);
  canvas.toBlob((result) => {
    if (!result) return;
    blob.value = result;
    imageUrl.value = URL.createObjectURL(result);
    const file = new File([result], fileName(), { type: "image/png" });
    canNativeShare.value = Boolean(navigator.canShare?.({ files: [file] }));
    shareOpen.value = true;
  }, "image/png");
};
const closeShare = () => {
  shareOpen.value = false;
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = null;
  blob.value = null;
};
const download = () => {
  if (!imageUrl.value) return;
  const link = document.createElement("a");
  link.href = imageUrl.value;
  link.download = fileName();
  link.click();
  closeShare();
};
const nativeShare = async () => {
  if (!blob.value) return;
  try {
    await navigator.share({
      files: [new File([blob.value], fileName(), { type: "image/png" })],
      title: `${t("history.summary.cardTitle", summary.value.label)} · SwiftFlow`,
      text: t(
        `${P}shareText`,
        summary.value.label,
        summary.value.sessions,
        summary.value.minutes
      ),
    });
    closeShare();
  } catch {
    // The share sheet was closed: the preview stays, to download instead
  }
};
</script>
