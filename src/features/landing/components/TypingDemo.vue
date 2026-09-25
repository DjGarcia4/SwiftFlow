<template>
  <!--
    The hero's demo: a sentence typing itself the way a session looks --
    letters going green, one slip in red and fixed, the combo bar filling
    and the wpm climbing. Plays on a loop; with reduced motion it just
    shows the finished sentence.
  -->
  <div
    class="rounded-card border-2 border-faded-gray bg-paper-white p-5 shadow-2xl shadow-primary/10 sm:p-6"
    aria-hidden="true"
  >
    <div class="mb-4 flex items-center gap-1.5">
      <span class="h-2.5 w-2.5 rounded-full bg-danger/60"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
    </div>

    <!-- The header row of a real session: wpm, combo, progress -->
    <div class="mb-4 flex items-center gap-3">
      <div class="flex items-baseline gap-1">
        <span class="font-display text-3xl font-extrabold tabular-nums text-charcoal">{{
          wpm
        }}</span>
        <span class="text-[10px] font-bold uppercase text-pencil-gray">wpm</span>
      </div>
      <FireIcon
        class="h-5 w-5 flex-shrink-0"
        :class="broke ? 'text-danger' : 'text-primary'"
      />
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex justify-between text-[11px] font-extrabold leading-none">
          <span :class="broke ? 'text-danger' : 'text-primary'">x{{ streak }}</span>
          <span class="text-pencil-gray">{{ nextMilestone }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-faded-gray/40">
          <div
            class="h-full rounded-full transition-[width,background-color] duration-200 ease-out"
            :class="broke ? 'bg-danger' : 'bg-primary'"
            :style="{ width: `${comboFraction * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <p class="min-h-[6.5rem] font-mono text-xl leading-relaxed sm:text-2xl">
      <span v-for="(char, index) in text" :key="index" :class="charClass(index)">{{
        char
      }}</span
      ><span
        v-if="typed.length >= text.length"
        class="inline-block w-0.5 animate-pulse bg-primary"
        >&nbsp;</span
      >
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { FireIcon } from "@heroicons/vue/24/solid";
import { prefersReducedMotion } from "@/shared/utils/motion";
import { comboProgress } from "@/features/typing-test/utils/comboMilestones";
import { t } from "@/shared/i18n";

// The sentence, in the language being used
const text = computed(() => t("landing.features.demo.typed"));
// Where the demo slips: types this instead, notices, and fixes it
const slipAt = computed(
  () => text.value.indexOf(t("landing.features.demo.slipWord")) + 4
);
const SLIP_CHAR = "s";
// Around 70 wpm: quick, but a pace a visitor can believe
const KEY_MS = 150;
const HOLD_END_MS = 2200;

// What's been typed so far, which may end in the wrong letter
const typed = ref("");
const streak = ref(0);
const broke = ref(false);
const startedAt = ref(0);
const elapsed = ref(0);

const wpm = computed(() => {
  if (!elapsed.value) return 0;
  const correct = [...typed.value].filter((c, i) => c === text.value[i]).length;
  return Math.round(correct / 5 / (elapsed.value / 60000));
});

const progress = computed(() => comboProgress(streak.value));
const comboFraction = computed(() => progress.value.fraction);
const nextMilestone = computed(() => progress.value.next ?? "");

const charClass = (index) => {
  const caret =
    index === typed.value.length ? "shadow-[inset_2px_0_0_var(--color-primary)]" : "";
  if (index >= typed.value.length) return `text-pencil-gray ${caret}`;
  return typed.value[index] === text.value[index]
    ? "font-bold text-success"
    : "rounded-sm bg-danger-tint text-danger";
};

let timer = null;
const wait = (ms) =>
  new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });

let running = true;
const type = async (char) => {
  typed.value += char;
  if (char === text.value[typed.value.length - 1]) {
    streak.value++;
    broke.value = false;
  } else {
    streak.value = 0;
    broke.value = true;
  }
  elapsed.value = Date.now() - startedAt.value;
  // A little uneven, the way people type
  await wait(KEY_MS * (0.6 + Math.random() * 0.9));
};

const play = async () => {
  while (running) {
    typed.value = "";
    streak.value = 0;
    broke.value = false;
    startedAt.value = Date.now();
    elapsed.value = 0;
    await wait(600);

    // A change of language mid-sentence starts the new one over
    const sentence = text.value;
    for (let i = 0; i < sentence.length && running && sentence === text.value; i++) {
      if (i === slipAt.value) {
        await type(SLIP_CHAR);
        await wait(350);
        typed.value = typed.value.slice(0, -1);
        await wait(200);
      }
      await type(sentence[i]);
    }
    await wait(HOLD_END_MS);
  }
};

onMounted(() => {
  if (prefersReducedMotion()) {
    const showFinished = (sentence) => {
      typed.value = sentence;
      streak.value = sentence.length;
    };
    showFinished(text.value);
    watch(text, showFinished);
    elapsed.value = 9000;
    return;
  }
  play();
});

onUnmounted(() => {
  running = false;
  clearTimeout(timer);
});
</script>
