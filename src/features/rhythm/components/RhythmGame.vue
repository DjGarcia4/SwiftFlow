<template>
  <!--
    "Ritmo": the letters fall onto a line in time with the music and each
    one is typed as it lands. Placed like the typing test: dead-centered on
    phones, and on desktop a column whose top spacer clears the nav and the
    settings bar while it's up. Drawn with the app's own cards and tokens.
  -->
  <div
    class="fixed top-1/2 left-1/2 z-0 w-full -translate-x-1/2 -translate-y-1/2 max-h-[min(88vh,calc(100vh-7rem))] overflow-y-auto sm:top-0 sm:right-0 sm:bottom-0 sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:max-h-none sm:flex sm:flex-col"
  >
    <div
      class="hidden sm:block flex-1"
      :class="phase === 'idle' ? 'min-h-[9.25rem]' : 'min-h-[5.5rem]'"
      aria-hidden="true"
    ></div>

    <section
      class="w-full max-w-4xl mx-auto px-4 sm:px-6 flex-shrink-0 space-y-4"
      :aria-label="t('rhythm.title')"
      data-rhythm
    >
      <!-- The scoreboard: like the live stats over the typing text -->
      <div class="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        <div class="bg-paper-white rounded-card border-2 border-faded-gray px-3 py-2">
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-primary tabular-nums"
            data-rhythm-score
          >
            <span :key="scoreBump" class="inline-block rhythm-bump">
              {{ live.score.toLocaleString(locale) }}
            </span>
          </div>
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            {{ t("rhythm.hud.score") }}
          </div>
        </div>
        <div
          class="relative rounded-card border-2 px-3 py-2 transition-[border-color,background-color] duration-300"
          :class="
            live.star
              ? 'border-primary bg-primary-tint rhythm-glow'
              : 'border-faded-gray bg-paper-white'
          "
        >
          <div
            class="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-display font-extrabold text-charcoal tabular-nums"
          >
            <FireIcon
              class="h-6 w-6 transition-colors duration-300"
              :class="[
                flameColor ? '' : 'text-faded-gray',
                live.combo >= COMBO_STEP ? 'rhythm-flicker' : '',
              ]"
              :style="flameColor ? { color: flameColor } : null"
            />
            <span :key="live.multiplier" class="inline-block animate-pop-in">
              ×{{ live.multiplier }}
            </span>
          </div>
          <div
            class="mx-auto mt-1 h-1.5 w-full max-w-[8rem] rounded-full bg-faded-gray/50"
          >
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-150"
              :style="{ width: `${multiplierFill}%` }"
            ></div>
          </div>
          <p
            v-if="live.star"
            class="absolute inset-x-0 -bottom-3 mx-auto w-fit rounded-full bg-primary px-2 text-[10px] font-extrabold uppercase tracking-wide text-white animate-pop-in"
          >
            {{ t("rhythm.hud.star") }}
          </p>
        </div>
        <div class="bg-paper-white rounded-card border-2 border-faded-gray px-3 py-2">
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-success tabular-nums"
          >
            {{ Math.floor(liveAccuracy) }}%
          </div>
          <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
            {{ t("rhythm.hud.accuracy") }}
          </div>
        </div>
      </div>

      <!-- The stage -->
      <div
        class="relative overflow-hidden rounded-card border-2 bg-paper-white transition-[border-color] duration-300"
        :class="live.star ? 'border-primary rhythm-glow' : 'border-faded-gray'"
      >
        <!-- The song, and how much of it is left -->
        <div class="flex items-center gap-3 px-4 pt-3">
          <MusicalNoteIcon class="h-4 w-4 flex-shrink-0 text-primary" />
          <p class="text-sm font-extrabold text-charcoal">
            {{ t(`rhythm.tracks.${track.id}`) }}
            <span class="font-bold text-pencil-gray">
              · {{ t("rhythm.bpm", track.bpm) }} ·
              {{ t(`rhythm.difficulties.${rhythm.difficulty}`) }}
            </span>
          </p>
          <div
            class="ml-auto h-2 w-24 sm:w-40 overflow-hidden rounded-full bg-faded-gray/50"
            role="progressbar"
            :aria-valuenow="Math.round(progress)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="t('rhythm.hud.progress', Math.round(progress))"
          >
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <canvas
          ref="canvas"
          class="block w-full transition-[height] duration-300"
          :class="CANVAS_HEIGHT[phase]"
          aria-hidden="true"
        ></canvas>

        <!-- The words: the one landing now, letter by letter, and the next -->
        <div
          v-if="phase === 'playing' && words.length"
          class="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono"
          aria-hidden="true"
        >
          <Transition name="rhythm-word" mode="out-in">
            <div :key="currentWord">
              <p class="text-2xl sm:text-3xl font-bold tracking-[0.2em]">
                <span
                  v-for="(char, index) in currentWordChars"
                  :key="index"
                  class="inline-block transition-[color,translate] duration-150"
                  :class="letterClass(index)"
                  >{{ char }}</span
                >
              </p>
              <p class="mt-0.5 text-sm tracking-[0.25em] text-pencil-gray/70">
                {{ nextWords.join("  ") }}
              </p>
            </div>
          </Transition>
        </div>

        <!-- Before a run: what it is and the way in -->
        <div
          v-if="phase === 'idle'"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-paper-white/70 px-4 py-4 text-center"
          data-rhythm-intro
        >
          <h2
            class="flex items-center gap-2 text-subheading font-display font-extrabold text-charcoal"
          >
            <MusicalNoteIcon class="h-5 w-5 text-primary" />
            {{ t("rhythm.intro.heading") }}
          </h2>
          <p class="hidden sm:block max-w-lg text-sm text-pencil-gray">
            {{ t("rhythm.intro.body") }}
          </p>

          <!-- The song: each with its tempo and its mood -->
          <div class="w-full max-w-2xl">
            <p
              class="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-pencil-gray"
            >
              {{ t("rhythm.toolbar.track") }} <KeyCap>↑</KeyCap><KeyCap>↓</KeyCap>
            </p>
            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-2"
              role="radiogroup"
              :aria-label="t('rhythm.toolbar.track')"
            >
              <button
                v-for="each in TRACKS"
                :key="each.id"
                type="button"
                role="radio"
                :aria-checked="rhythm.track === each.id"
                class="rounded-xl border-2 px-2 py-1.5 text-left transition-[background-color,border-color] duration-150"
                :class="
                  rhythm.track === each.id
                    ? 'border-primary bg-primary-tint'
                    : 'border-faded-gray bg-paper-white/90 hover:border-primary/50'
                "
                :data-rhythm-track="each.id"
                @click="rhythm.setTrack(each.id)"
              >
                <span class="block text-sm font-extrabold text-charcoal">
                  {{ t(`rhythm.tracks.${each.id}`) }}
                </span>
                <span class="block text-[11px] font-bold text-pencil-gray">
                  {{ t("rhythm.bpm", each.bpm) }} ·
                  {{ t(`rhythm.trackMoods.${each.id}`) }}
                </span>
              </button>
            </div>
          </div>

          <!-- How hard: a bar per level, filling up -->
          <div class="w-full max-w-2xl">
            <p
              class="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-pencil-gray"
            >
              {{ t("rhythm.toolbar.difficulty") }} <KeyCap>←</KeyCap><KeyCap>→</KeyCap>
            </p>
            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-2"
              role="radiogroup"
              :aria-label="t('rhythm.toolbar.difficulty')"
            >
              <button
                v-for="(level, index) in DIFFICULTY_IDS"
                :key="level"
                type="button"
                role="radio"
                :aria-checked="rhythm.difficulty === level"
                class="rounded-xl border-2 px-2 py-1.5 text-left transition-[background-color,border-color] duration-150"
                :class="
                  rhythm.difficulty === level
                    ? 'border-primary bg-primary-tint'
                    : 'border-faded-gray bg-paper-white/90 hover:border-primary/50'
                "
                :data-rhythm-difficulty-level="level"
                @click="rhythm.setDifficulty(level)"
              >
                <span class="flex items-center justify-between gap-2">
                  <span class="text-sm font-extrabold text-charcoal">
                    {{ t(`rhythm.difficulties.${level}`) }}
                  </span>
                  <span class="flex items-end gap-0.5" aria-hidden="true">
                    <span
                      v-for="bar in DIFFICULTY_IDS.length"
                      :key="bar"
                      class="w-1 rounded-full"
                      :class="bar <= index + 1 ? 'bg-primary' : 'bg-faded-gray'"
                      :style="{ height: `${4 + bar * 3}px` }"
                    ></span>
                  </span>
                </span>
                <span class="block text-[11px] font-bold text-pencil-gray">
                  {{ t(`rhythm.difficultyHints.${level}`) }}
                </span>
              </button>
            </div>
          </div>
          <p v-if="bestScore" class="text-sm font-extrabold text-primary">
            {{ t("rhythm.intro.best", bestScore.toLocaleString(locale)) }}
          </p>
          <p
            v-if="!chart.notes.length"
            class="rounded-xl bg-danger-tint px-4 py-2 text-sm font-bold text-danger"
          >
            {{ t("rhythm.intro.noWords") }}
          </p>
          <IconButton
            v-else
            icon="play"
            size="md"
            :text="t('rhythm.intro.start')"
            data-rhythm-start
            @click="start"
          />
          <p class="text-xs font-bold text-pencil-gray">
            {{ t("rhythm.intro.startKey") }}
          </p>
          <p
            v-if="touchOnly"
            class="max-w-sm rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-charcoal"
          >
            {{ t("rhythm.intro.keyboardNeeded") }}
          </p>
          <p
            v-if="!sound.soundEnabled"
            class="max-w-sm rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-charcoal"
          >
            {{ t("rhythm.intro.soundOff") }}
          </p>
          <div class="flex items-center gap-2 text-xs font-bold text-pencil-gray">
            <span class="font-mono">{{ t("rhythm.toolbar.offset", rhythm.offset) }}</span>
            <IconButton
              variant="secondary"
              size="xs"
              :text="t('rhythm.toolbar.calibrate')"
              data-rhythm-calibrate
              @click="calibrating = true"
            />
          </div>
        </div>

        <RhythmCalibration
          v-if="calibrating"
          class="absolute inset-0"
          @close="calibrating = false"
        />
      </div>

      <!-- After a run: the same result cards as the typing test -->
      <div v-if="phase === 'done' && summary" class="space-y-4" data-rhythm-results>
        <div class="flex flex-col items-center text-center">
          <p class="text-xs font-extrabold uppercase tracking-wide text-pencil-gray">
            {{ t("rhythm.results.heading") }}
          </p>
          <!-- The rank, stamped -->
          <div
            v-if="rank"
            class="rhythm-stamp mt-2 flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 bg-paper-white shadow-lg"
            :class="RANK_CLASS[rank]"
            data-rhythm-rank
          >
            <span class="font-display text-5xl font-black leading-none">{{ rank }}</span>
            <span class="text-[10px] font-extrabold uppercase tracking-widest">
              {{ t("rhythm.results.rank") }}
            </span>
          </div>
          <p
            v-if="newBest || summary.fullCombo"
            class="mt-2 flex flex-wrap justify-center gap-2 text-sm font-extrabold"
          >
            <span
              v-if="newBest"
              class="inline-flex items-center gap-1.5 rounded-xl border-2 border-primary/40 bg-primary-tint px-3 py-1 text-primary animate-pop-in"
            >
              <TrophyIcon class="h-4 w-4" />{{ t("rhythm.results.newBest") }}
            </span>
            <span
              v-if="summary.fullCombo"
              class="inline-flex items-center gap-1.5 rounded-xl border-2 border-success/40 bg-success-tint px-3 py-1 text-success-dark animate-pop-in"
            >
              <CheckBadgeIcon class="h-4 w-4" />{{ t("rhythm.results.fullCombo") }}
            </span>
          </p>
        </div>
        <div class="grid gap-4 sm:gap-6 text-center grid-cols-2 sm:grid-cols-4">
          <div
            v-for="(card, index) in resultCards"
            :key="card.label"
            class="bg-paper-white rounded-card p-4 sm:p-5 border-2 border-faded-gray animate-rise"
            :style="staggerStyle(index, { step: 80, base: 80 })"
          >
            <div
              class="text-2xl sm:text-3xl font-display font-extrabold mb-1"
              :class="card.color"
            >
              <AnimatedNumber
                :value="card.value"
                :decimals="card.decimals"
                :format="card.format"
              />{{ card.suffix }}
            </div>
            <div
              class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
            >
              {{ card.label }}
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
          <div
            v-for="(grade, index) in GRADES"
            :key="grade"
            class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
            :style="staggerStyle(index, { step: 70, base: 400 })"
          >
            <span class="font-extrabold" :class="GRADE_CLASS[grade]">{{
              summary.counts[grade]
            }}</span>
            <span class="text-pencil-gray font-bold">{{
              t(`rhythm.grades.${grade}`)
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          >
            <span class="font-extrabold text-charcoal">{{ offsetText }}</span>
            <span class="text-pencil-gray font-bold">{{
              t("rhythm.results.spread", summary.spread)
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          >
            <span class="font-extrabold text-charcoal">{{ resultWpm }}</span>
            <span class="text-pencil-gray font-bold">{{ t("rhythm.results.wpm") }}</span>
          </div>
          <div
            v-if="summary.holds.total"
            class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          >
            <span class="font-extrabold text-charcoal"
              >{{ summary.holds.held }}/{{ summary.holds.total }}</span
            >
            <span class="text-pencil-gray font-bold">{{
              t("rhythm.results.holds")
            }}</span>
          </div>
          <div
            v-if="summary.stars"
            class="inline-flex items-center gap-1.5 rounded-xl border-2 border-primary/40 bg-primary-tint px-3 py-1.5 font-extrabold text-primary animate-pop-in"
          >
            {{ t("rhythm.results.stars", summary.stars) }}
          </div>
        </div>
        <p
          v-if="Math.abs(summary.offset) >= 35"
          class="mx-auto max-w-md text-center text-sm font-bold text-pencil-gray"
        >
          {{ t("rhythm.results.offsetTip", summary.offset) }}
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <IconButton
            icon="restart"
            size="md"
            :text="t('rhythm.results.again')"
            data-rhythm-again
            @click="start"
          />
          <IconButton
            variant="secondary"
            size="md"
            :text="t('rhythm.results.change')"
            @click="backToIdle"
          />
        </div>
        <p class="text-center text-xs font-bold text-pencil-gray">
          {{ t("rhythm.results.againKey") }}
        </p>
      </div>

      <p
        v-if="phase === 'playing'"
        class="text-center text-xs font-bold text-pencil-gray"
        aria-hidden="true"
      >
        {{ t("rhythm.hud.quit") }}
      </p>
    </section>

    <div class="hidden sm:block flex-1 min-h-8" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from "vue";
import {
  MusicalNoteIcon,
  FireIcon,
  TrophyIcon,
  CheckBadgeIcon,
} from "@heroicons/vue/24/outline";
import IconButton from "@/shared/components/IconButton.vue";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import { t, locale } from "@/shared/i18n";
import { announce } from "@/shared/utils/announcer";
import { prefersReducedMotion, staggerStyle } from "@/shared/utils/motion";
import { useSoundStore } from "@/shared/stores/sound";
import { useConfigStore } from "@/features/typing-test/store";
import { useHistoryStore } from "@/features/history/store";
import { practiceWords } from "@/features/typing-test/content/words";
import { resultLanguage } from "@/features/typing-test/content/practiceLanguage";
import { keyboardTarget, fingerOfChar } from "@/features/typing-test/utils/keyboardMap";
import { isEditable } from "@/features/command-palette/keys";
import { useRhythmStore } from "@/features/rhythm/store";
import { TRACKS, TRACK_IDS, trackById, trackTimeline } from "@/features/rhythm/tracks";
import { buildChart, DIFFICULTIES, DIFFICULTY_IDS } from "@/features/rhythm/chart";
import { createRun, GRADES, COMBO_STEP, MAX_MULTIPLIER } from "@/features/rhythm/judge";
import { createPlayer } from "@/features/rhythm/synth";
import { createStage, laneOf } from "@/features/rhythm/stage";
import { bestRhythmScore, rhythmResult, rhythmRank } from "@/features/rhythm/results";
import { playCelebrationSound } from "@/shared/utils/sound";
import { getCharacterStreakColorRgb } from "@/shared/utils/flameColor";
import RhythmCalibration from "./RhythmCalibration.vue";
import KeyCap from "@/features/command-palette/components/KeyCap.vue";

// Tall to play in, roomy for the start screen, and short on the results so
// the cards fit under it
const CANVAS_HEIGHT = {
  idle: "h-[clamp(26rem,56vh,30rem)]",
  playing: "h-[clamp(16rem,46vh,26rem)]",
  done: "h-[clamp(8rem,18vh,11rem)]",
};

const RANK_CLASS = {
  S: "border-primary text-primary shadow-primary/30",
  A: "border-success text-success shadow-success/30",
  B: "border-charcoal/40 text-charcoal",
  C: "border-faded-gray text-pencil-gray",
  D: "border-faded-gray text-pencil-gray",
};

const GRADE_CLASS = {
  perfect: "text-primary",
  good: "text-success",
  early: "text-charcoal",
  late: "text-charcoal",
  miss: "text-danger",
};

const rhythm = useRhythmStore();
const configStore = useConfigStore();
const historyStore = useHistoryStore();
const sound = useSoundStore();

const track = computed(() => trackById(rhythm.track));
const timeline = computed(() => trackTimeline(track.value));

// "idle" (the intro), "playing" or "done" (the results)
const phase = ref("idle");
const calibrating = ref(false);
// A phone or tablet without a keyboard: there's nothing to hit the letters
// with
const touchOnly =
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;

// The settings bar stays out of the way while playing and on the results,
// as it does for the typing test
watch(phase, (now) => configStore.setGameRunning(now !== "idle"));

// One key each, no Shift, no dead key: a letter has to be one press to be
// typed on a beat
const canType = (char) => {
  const target = keyboardTarget(char, configStore.keyboardLayout);
  return Boolean(
    target && !target.shift && !target.altgr && !target.dead && target.key !== " "
  );
};

const makeChart = () =>
  buildChart({
    track: track.value,
    difficulty: rhythm.difficulty,
    bank: practiceWords(),
    canType,
  });

const chart = shallowRef(makeChart());
const words = computed(() => chart.value.words);
const lanes = computed(
  () =>
    new Map(
      chart.value.notes.map((note) => [
        note.id,
        laneOf(fingerOfChar(note.char, configStore.keyboardLayout)),
      ])
    )
);

// A new chart whenever what it's built from changes, between runs
watch(
  () => [
    rhythm.track,
    rhythm.difficulty,
    configStore.textLanguage,
    configStore.keyboardLayout,
  ],
  () => {
    if (phase.value === "playing") return;
    chart.value = makeChart();
    phase.value = "idle";
    stage?.clear();
    startIdleLoop();
  }
);

// What the HUD shows, refreshed as notes are judged (not every frame)
const emptyLive = () => ({
  score: 0,
  combo: 0,
  multiplier: 1,
  star: false,
  stars: 0,
  judgedCount: 0,
  counts: Object.fromEntries(GRADES.map((grade) => [grade, 0])),
});
const live = ref(emptyLive());
// Bumped on every point scored, so the score can pop
const scoreBump = ref(0);
// The multiplier's flame, warming up with the combo
const flameColor = computed(() =>
  live.value.combo >= COMBO_STEP
    ? `rgb(${getCharacterStreakColorRgb(15 + live.value.combo).join(" ")})`
    : null
);
// The letter to type next in the word on screen
const nextLetter = computed(() => {
  const word = words.value[currentWord.value];
  if (!word) return -1;
  return currentWordChars.value.findIndex((_, index) => !marks.value[word.first + index]);
});
const progress = ref(0);
const multiplierFill = computed(() =>
  live.value.multiplier >= MAX_MULTIPLIER
    ? 100
    : ((live.value.combo % COMBO_STEP) / COMBO_STEP) * 100
);
const liveAccuracy = computed(() => {
  const { judgedCount, counts } = live.value;
  return judgedCount ? ((judgedCount - counts.miss) / judgedCount) * 100 : 100;
});

// The word being typed: the one the next waiting letter belongs to
const currentWord = ref(0);
const marks = ref({}); // note id -> grade, for the word on screen
const currentWordChars = computed(() => [
  ...(words.value[currentWord.value]?.text ?? ""),
]);
const nextWords = computed(() =>
  words.value.slice(currentWord.value + 1, currentWord.value + 3).map((word) => word.text)
);
const letterClass = (index) => {
  const word = words.value[currentWord.value];
  const grade = word ? marks.value[word.first + index] : null;
  if (!grade) {
    return index === nextLetter.value
      ? "text-primary underline decoration-4 underline-offset-8 -translate-y-0.5"
      : "text-charcoal";
  }
  return grade === "miss" ? "text-danger" : "text-success";
};

const summary = ref(null);
const rank = ref(null);
const resultWpm = ref(0);
const newBest = ref(false);
const bestScore = computed(() =>
  bestRhythmScore(historyStore.results, rhythm.track, rhythm.difficulty)
);
const offsetText = computed(() => {
  const ms = summary.value?.offset ?? 0;
  if (Math.abs(ms) < 5) return t("rhythm.results.offsetCentered");
  return ms > 0
    ? t("rhythm.results.offsetLate", ms)
    : t("rhythm.results.offsetEarly", -ms);
});

// Score, letters hit, timing and best combo, as the typing test's cards
const resultCards = computed(() => {
  const result = summary.value;
  if (!result) return [];
  return [
    {
      label: t("rhythm.results.score"),
      value: result.score,
      color: "text-primary",
      format: (value) => Math.round(value).toLocaleString(locale.value),
    },
    {
      label: t("rhythm.results.accuracy"),
      value: result.accuracy,
      decimals: 1,
      suffix: "%",
      color: "text-success",
    },
    {
      label: t("rhythm.results.timing"),
      value: result.timing,
      decimals: 1,
      suffix: "%",
      color: "text-success",
    },
    {
      label: t("rhythm.results.maxCombo"),
      value: result.maxCombo,
      color: "text-charcoal",
    },
  ];
});

const canvas = ref(null);
let stage = null;
let player = null;
let run = null;
let frame = null;
let resizeObserver = null;
// What keys were asked for and missed, for the history's key stats
let keyStats = null;

const labels = computed(() =>
  Object.fromEntries(
    [...GRADES, "held", "dropped"].map((grade) => [grade, t(`rhythm.grades.${grade}`)])
  )
);

const countdown = computed(() => t("rhythm.hud.countdown"));

const drawFrame = (now, { notes = chart.value.notes, judgmentOf } = {}) => {
  if (!stage) return;
  stage.draw({
    now,
    beatMs: timeline.value.beatMs,
    approachMs: DIFFICULTIES[rhythm.difficulty].approachMs,
    playStartMs: phase.value === "playing" ? timeline.value.playStartMs : null,
    countdown: countdown.value,
    star: live.value.star,
    combo: live.value.combo,
    notes,
    laneOf: (note) => lanes.value.get(note.id) ?? 3,
    judgmentOf: judgmentOf ?? ((note) => run?.judgmentOf(note.id) ?? null),
    labels: labels.value,
    reducedMotion: prefersReducedMotion(),
  });
};

// The start screen plays a demo behind it: the first letters of the chart
// falling and landing on their own, over and over. After a run, the same
// loop keeps the confetti going until it settles.
const DEMO_NOTES = 20;
let idleFrame = null;
let demoStart = 0;
let demoCycle = -1;
let demoSeen = new Set();

const drawDemo = () => {
  const notes = chart.value.notes.slice(0, DEMO_NOTES);
  if (!notes.length) {
    drawFrame(-Infinity);
    return;
  }
  const { beatMs } = timeline.value;
  const approach = DIFFICULTIES[rhythm.difficulty].approachMs;
  const first = notes[0].time;
  const last = notes.at(-1).time + (notes.at(-1).hold ?? 0);
  const loopMs = last - first + approach + beatMs * 2;
  const elapsed = prefersReducedMotion() ? approach : performance.now() - demoStart;
  const cycle = Math.floor(elapsed / loopMs);
  if (cycle !== demoCycle) {
    demoCycle = cycle;
    demoSeen = new Set();
  }
  const now = first - approach + (elapsed % loopMs);
  for (const note of notes) {
    if (now < note.time || demoSeen.has(note.id)) continue;
    demoSeen.add(note.id);
    stage.judged({
      lane: lanes.value.get(note.id) ?? 3,
      grade: "perfect",
      reducedMotion: prefersReducedMotion(),
    });
  }
  drawFrame(now, {
    notes,
    judgmentOf: (note) => {
      if (now < note.time) return null;
      if (!note.hold) return { grade: "perfect" };
      return { grade: "perfect", hold: now < note.time + note.hold ? "holding" : "held" };
    },
  });
};

const idleLoop = () => {
  if (phase.value === "playing") return;
  if (phase.value === "idle") drawDemo();
  else drawFrame(timeline.value.durationMs);
  // The demo keeps going; the results only until the confetti lands
  if (phase.value === "idle" ? !prefersReducedMotion() : stage?.busy()) {
    idleFrame = requestAnimationFrame(idleLoop);
  } else {
    idleFrame = null;
  }
};

const startIdleLoop = () => {
  cancelAnimationFrame(idleFrame);
  demoStart = performance.now();
  demoCycle = -1;
  idleFrame = requestAnimationFrame(idleLoop);
};

// A judged note: the HUD, the word, the stage and the sound
// The end of a held letter: down to the end, or let go too soon
const onHoldEnd = (judgment, now) => {
  const { note, held } = judgment;
  stage?.judged({
    lane: lanes.value.get(note.id) ?? 3,
    grade: held ? "held" : "dropped",
    points: judgment.points,
    reducedMotion: prefersReducedMotion(),
  });
  if (held) player?.hit(note.time + note.hold, note.index + 2, true);
  live.value = run.state(now);
  scoreBump.value++;
};

const onJudged = (judgment, now) => {
  if (judgment.kind === "hold") {
    onHoldEnd(judgment, now);
    return;
  }
  const { note, grade } = judgment;
  const before = live.value;
  marks.value = { ...marks.value, [note.id]: grade };
  stage?.judged({
    lane: lanes.value.get(note.id) ?? 3,
    grade,
    points: judgment.points,
    reducedMotion: prefersReducedMotion(),
  });
  keyStats.attempts[note.char] = (keyStats.attempts[note.char] ?? 0) + 1;
  if (grade === "miss") {
    keyStats.missed[note.char] = (keyStats.missed[note.char] ?? 0) + 1;
    if (judgment.typed) {
      const pair = `${note.char}${judgment.typed}`;
      keyStats.confusions[pair] = (keyStats.confusions[pair] ?? 0) + 1;
    }
    player?.miss();
  } else {
    player?.hit(note.time, note.index, grade === "perfect");
  }
  live.value = run.state(now);
  scoreBump.value++;
  // The multiplier going up, and the star mode lighting, said big
  if (live.value.stars > before.stars) {
    stage?.milestone({
      text: t("rhythm.hud.star"),
      kind: "star",
      reducedMotion: prefersReducedMotion(),
    });
  } else if (live.value.multiplier > before.multiplier) {
    stage?.milestone({
      text: `×${live.value.multiplier}`,
      reducedMotion: prefersReducedMotion(),
    });
  }
  // On to the next word once this one's done
  const next = chart.value.notes.find((each) => !run.judgmentOf(each.id));
  if (next && next.word !== currentWord.value) {
    currentWord.value = next.word;
    marks.value = {};
  }
};

const loop = () => {
  if (phase.value !== "playing") return;
  const now = player.now();
  for (const judgment of run.sweep(now - rhythm.offset)) onJudged(judgment, now);
  if (live.value.star && !run.state(now).star) live.value = run.state(now);
  progress.value = Math.max(0, Math.min(100, (now / timeline.value.durationMs) * 100));
  drawFrame(now);
  if (now >= timeline.value.durationMs) {
    finish();
    return;
  }
  frame = requestAnimationFrame(loop);
};

const start = () => {
  if (!chart.value.notes.length) return;
  cancelAnimationFrame(idleFrame);
  idleFrame = null;
  stopPlayer();
  calibrating.value = false;
  chart.value = makeChart();
  run = createRun(chart.value.notes);
  keyStats = { attempts: {}, missed: {}, confusions: {} };
  live.value = emptyLive();
  progress.value = 0;
  currentWord.value = 0;
  marks.value = {};
  summary.value = null;
  stage?.clear();
  player = createPlayer(track.value, { volume: sound.soundEnabled ? 1 : 0 });
  player.start();
  phase.value = "playing";
  announce(t("rhythm.announce.started", t(`rhythm.tracks.${track.value.id}`)));
  frame = requestAnimationFrame(loop);
};

const stopPlayer = () => {
  cancelAnimationFrame(frame);
  frame = null;
  player?.stop();
  player = null;
};

const finish = () => {
  stopPlayer();
  // Whatever was still falling is missed, and the scoreboard says so
  run.sweep(Infinity);
  live.value = { ...run.state(Infinity), star: false };
  const result = run.summary();
  const before = bestScore.value;
  const entry = rhythmResult({
    summary: result,
    notes: chart.value.notes,
    track: track.value,
    difficulty: rhythm.difficulty,
    keyStats,
    textLanguage: resultLanguage("rhythm"),
  });
  summary.value = result;
  resultWpm.value = entry.wpm;
  newBest.value = before > 0 && result.score > before;
  rank.value = rhythmRank(result);
  phase.value = "done";
  // A song played without touching a key isn't a run to keep
  if (result.hits > 0) historyStore.recordResult(entry);
  // A great run gets confetti, and the fanfare if sounds are on
  if (newBest.value || result.fullCombo || rank.value === "S" || rank.value === "A") {
    stage?.celebrate({ reducedMotion: prefersReducedMotion() });
    if (sound.soundEnabled && sound.celebrationSound) playCelebrationSound();
  }
  startIdleLoop();
  announce(t("rhythm.announce.finished", result.score, result.accuracy));
};

// Esc: out, nothing saved
const quit = () => {
  stopPlayer();
  phase.value = "idle";
  live.value = emptyLive();
  progress.value = 0;
  stage?.clear();
  startIdleLoop();
};

const backToIdle = () => {
  phase.value = "idle";
  live.value = emptyLive();
  progress.value = 0;
  stage?.clear();
  startIdleLoop();
};

const onKeydown = (event) => {
  if (calibrating.value) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  if (isEditable(event.target) || document.querySelector("[aria-modal='true']")) return;

  if (phase.value !== "playing") {
    if (event.repeat) return;
    // On the start screen the arrows pick: ←→ the level, ↑↓ the song
    const arrows = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };
    if (
      phase.value === "idle" &&
      event.key in arrows &&
      !event.target.closest?.("[role=radiogroup]")
    ) {
      event.preventDefault();
      const step = arrows[event.key];
      const [list, current, set] =
        event.key.startsWith("ArrowL") || event.key.startsWith("ArrowR")
          ? [DIFFICULTY_IDS, rhythm.difficulty, rhythm.setDifficulty]
          : [TRACK_IDS, rhythm.track, rhythm.setTrack];
      set(list[(list.indexOf(current) + step + list.length) % list.length]);
      return;
    }
    const startKey = event.key === "Enter" || event.key === " ";
    if (startKey && phase.value === "idle" && !event.target.closest?.("button")) {
      event.preventDefault();
      start();
    } else if ((event.key === "Tab" || event.key === "Enter") && phase.value === "done") {
      event.preventDefault();
      start();
    }
    return;
  }

  // Mid-run every key belongs to the game
  if (event.key === "Escape") {
    event.preventDefault();
    quit();
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    start();
    return;
  }
  if (event.key.length !== 1) return;
  event.preventDefault();
  if (event.repeat || event.key === " ") return;

  // When the key went down, on the song's clock, the calibration taken off
  const at = player.now() - (performance.now() - event.timeStamp) - rhythm.offset;
  const char = event.key.toLowerCase();
  const lane = laneOf(fingerOfChar(char, configStore.keyboardLayout));
  stage?.flash(lane);
  const judgment = run.press(char, at);
  if (judgment) onJudged(judgment, player.now());
};

// Letting go of a key ends the held letters on it
const onKeyup = (event) => {
  if (phase.value !== "playing" || !run || event.key.length !== 1) return;
  const at = player.now() - (performance.now() - event.timeStamp) - rhythm.offset;
  for (const end of run.release(event.key.toLowerCase(), at)) onJudged(end, player.now());
};

// The window losing focus lets go of everything: no keyup will come
const onBlur = () => {
  if (phase.value !== "playing" || !run) return;
  const at = player.now() - rhythm.offset;
  for (const end of run.releaseAll(at)) onJudged(end, player.now());
};

onMounted(() => {
  stage = createStage(canvas.value);
  stage.resize();
  startIdleLoop();
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      stage.resize();
      if (phase.value !== "playing" && !idleFrame) {
        drawFrame(phase.value === "done" ? timeline.value.durationMs : -Infinity);
      }
    });
    resizeObserver.observe(canvas.value);
  }
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("keyup", onKeyup);
  window.addEventListener("blur", onBlur);
});

onUnmounted(() => {
  cancelAnimationFrame(idleFrame);
  stopPlayer();
  configStore.setGameRunning(false);
  resizeObserver?.disconnect();
  stage?.destroy?.();
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("keyup", onKeyup);
  window.removeEventListener("blur", onBlur);
});
</script>

<style scoped>
/* The score jumps a little with every point */
.rhythm-bump {
  animation: rhythm-bump 260ms var(--ease-spring);
}
@keyframes rhythm-bump {
  40% {
    transform: scale(1.12);
  }
}

/* The flame flickers once the multiplier is going */
.rhythm-flicker {
  animation: rhythm-flicker 900ms ease-in-out infinite;
  transform-origin: 50% 90%;
}
@keyframes rhythm-flicker {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.12) rotate(-5deg);
  }
  60% {
    transform: scale(0.95) rotate(4deg);
  }
}

/* Star mode: the cards glow in the accent */
.rhythm-glow {
  animation: rhythm-glow 1.2s ease-in-out infinite;
}
@keyframes rhythm-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent);
  }
  50% {
    box-shadow: 0 0 22px 2px color-mix(in srgb, var(--color-primary) 45%, transparent);
  }
}

/* The rank lands like a stamp */
.rhythm-stamp {
  animation: rhythm-stamp 700ms var(--ease-spring) 200ms backwards;
}
@keyframes rhythm-stamp {
  from {
    opacity: 0;
    transform: scale(2.4) rotate(-18deg);
  }
  60% {
    opacity: 1;
  }
}

/* The next word comes up from below */
.rhythm-word-enter-active,
.rhythm-word-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms var(--ease-smooth);
}
.rhythm-word-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.rhythm-word-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .rhythm-bump,
  .rhythm-flicker,
  .rhythm-glow,
  .rhythm-stamp {
    animation: none;
  }
}
</style>
