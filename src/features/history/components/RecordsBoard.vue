<template>
  <!--
    "Tus récords": the best of all up top, then every mode with each of its
    categories -- your record where you have one, with a way to race it,
    and where you don't, a way to set the first one.
  -->
  <div>
    <!-- The best of all -->
    <div
      v-if="topRecord"
      class="mb-5 flex items-center gap-4 overflow-hidden rounded-card border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-paper-white to-paper-white px-5 py-4 animate-rise"
    >
      <div
        class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30"
      >
        <TrophyIcon class="h-8 w-8" />
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-pencil-gray"
        >
          {{ t("history.records.top") }}
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display text-4xl font-black tabular-nums text-charcoal">{{
            topRecord.wpm
          }}</span>
          <span class="text-sm font-extrabold text-pencil-gray">wpm</span>
        </div>
        <div class="truncate text-xs font-bold text-pencil-gray">
          {{ formatModeLabel(topRecord) }} · {{ topRecord.accuracy }}% ·
          {{ ago(topRecord.date) }}
        </div>
      </div>
      <button
        type="button"
        class="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-sm font-extrabold text-white border-b-4 border-amber-700 transition-[background-color,scale] duration-200 ease-spring hover:bg-amber-600 active:scale-95"
        @click="play(topRecord.mode, topRecord.modeValue, topRecord)"
      >
        <BoltIcon class="h-4 w-4" />
        {{ t("history.records.beat") }}
      </button>
    </div>

    <p class="mb-3 text-xs font-bold text-pencil-gray">
      {{ t("history.records.count", heldCount, categoryCount) }}
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="(mode, index) in modes"
        :key="mode.id"
        class="rounded-card border-2 bg-paper-white p-4 animate-rise"
        :class="
          mode.rows.some((row) => row.best)
            ? 'border-faded-gray'
            : 'border-dashed border-faded-gray'
        "
        :style="staggerStyle(index, { step: 50, base: 80 })"
      >
        <div class="mb-2 flex items-center gap-2">
          <component :is="mode.icon" class="h-4 w-4 text-primary" />
          <span class="font-display text-sm font-extrabold text-charcoal">{{
            mode.name
          }}</span>
        </div>
        <ul class="space-y-1">
          <li
            v-for="row in mode.rows"
            :key="row.key"
            class="flex items-center gap-3 rounded-xl px-2 py-1.5"
            :class="row.best ? '' : 'bg-faded-gray/10'"
          >
            <span class="w-14 flex-shrink-0 text-xs font-bold text-pencil-gray">{{
              row.label
            }}</span>
            <template v-if="row.best">
              <span class="font-display text-lg font-black tabular-nums text-success">{{
                row.best.wpm
              }}</span>
              <span
                class="min-w-0 flex-1 truncate text-[11px] font-bold text-pencil-gray"
              >
                {{ row.best.accuracy }}% · {{ ago(row.best.date) }}
              </span>
            </template>
            <span v-else class="min-w-0 flex-1 text-xs font-bold text-pencil-gray/70">
              {{ t("history.records.none") }}
            </span>
            <button
              type="button"
              class="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border-2 px-2 py-0.5 text-[11px] font-extrabold transition-[background-color,color,scale] duration-200 ease-spring active:scale-95"
              :class="
                row.best
                  ? 'border-primary text-primary hover:bg-primary hover:text-white'
                  : 'border-faded-gray text-charcoal hover:border-primary hover:text-primary'
              "
              :aria-label="
                row.best
                  ? t('history.records.beatNamed', mode.name, row.label, row.best.wpm)
                  : t('history.records.startNamed', mode.name, row.label)
              "
              @click="play(mode.id, row.value, row.best)"
            >
              <BoltIcon v-if="row.best" class="h-3 w-3" />
              <PlayIcon v-else class="h-3 w-3" />
              {{ row.best ? t("history.records.beat") : t("history.records.start") }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  TrophyIcon,
  BoltIcon,
  PlayIcon,
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  ChatBubbleBottomCenterTextIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  CodeBracketIcon,
  HandRaisedIcon,
  ViewfinderCircleIcon,
  SparklesIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";
import { t, localeTag } from "@/shared/i18n";
import { staggerStyle } from "@/shared/utils/motion";
import { isSpeechSupported } from "@/shared/utils/speech";
import { useConfigStore } from "@/features/typing-test/store";
import { LANGUAGE_MODES } from "@/features/typing-test/content/practiceLanguage";
import {
  formatModeLabel,
  formatModeName,
  languageOf,
} from "@/features/history/utils/historyStats";

const props = defineProps({
  // computePersonalBests: the best run of each kind
  bests: { type: Array, required: true },
  // The texts' language the records are for (the modes that have one)
  language: { type: String, default: "es" },
});

const configStore = useConfigStore();
const router = useRouter();

// Every category there is a record for. Time and the counts by their
// value; the rest as one, their best of any length or text.
const CATEGORIES = [
  { id: "time", icon: ClockIcon, values: [15, 30, 60, 120], label: (v) => `${v} s` },
  {
    id: "words",
    icon: DocumentTextIcon,
    values: [10, 25, 50, 100],
    label: (v) => `${v}`,
  },
  { id: "numbers", icon: HashtagIcon, values: [10, 25, 50, 100], label: (v) => `${v}` },
  { id: "quote", icon: ChatBubbleBottomCenterTextIcon },
  { id: "classics", icon: BookOpenIcon },
  { id: "dictation", icon: SpeakerWaveIcon, needsSpeech: true },
  { id: "code", icon: CodeBracketIcon },
  { id: "fingers", icon: HandRaisedIcon },
  { id: "drill", icon: ViewfinderCircleIcon },
  { id: "zen", icon: SparklesIcon },
  { id: "custom", icon: PencilSquareIcon },
];

const canSpeak = isSpeechSupported();

// A record counts for these texts if the mode has no language, or it's in
// the one being looked at
const inLanguage = (best) =>
  !LANGUAGE_MODES.has(best.mode) || languageOf(best) === props.language;

const bestOf = (candidates) =>
  candidates.reduce((top, best) => (!top || best.wpm > top.wpm ? best : top), null);

const modes = computed(() =>
  CATEGORIES.filter((category) => !category.needsSpeech || canSpeak).map((category) => {
    const mine = props.bests.filter(
      (best) => best.mode === category.id && inLanguage(best)
    );
    const rows = category.values
      ? category.values.map((value) => ({
          key: `${category.id}:${value}`,
          value,
          label: category.label(value),
          best: bestOf(mine.filter((best) => best.modeValue === value)),
        }))
      : [
          {
            key: category.id,
            value: null,
            label: t("history.records.best"),
            best: bestOf(mine),
          },
        ];
    return {
      id: category.id,
      icon: category.icon,
      name: formatModeName(category.id),
      rows,
    };
  })
);

const topRecord = computed(() =>
  bestOf(modes.value.flatMap((mode) => mode.rows.map((row) => row.best)).filter(Boolean))
);
const heldCount = computed(
  () => modes.value.flatMap((mode) => mode.rows).filter((row) => row.best).length
);
const categoryCount = computed(() => modes.value.flatMap((mode) => mode.rows).length);

const ago = (iso) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  return new Intl.RelativeTimeFormat(localeTag(), { numeric: "auto" }).format(
    -days,
    "day"
  );
};

// Into that category: with a record, racing it -- the pacer at its speed;
// without one, just the category, to set the first
const play = (mode, value, best) => {
  if (configStore.type !== mode) configStore.handleType(mode);
  if (mode === "time" && value) configStore.handleTime(value);
  if ((mode === "words" || mode === "numbers") && value) configStore.handleWords(value);
  if (best && mode === "fingers" && best.fingers?.length)
    configStore.handleFingers(best.fingers);
  if (best && mode === "code" && best.modeValue)
    configStore.handleCodeLanguage(best.modeValue);
  if (best) configStore.setPacerWpm(Math.min(250, Math.max(10, best.wpm)));
  router.push("/");
};
</script>
