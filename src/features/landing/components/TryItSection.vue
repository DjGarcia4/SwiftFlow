<template>
  <!--
    "Probalo acá": a sentence to type right on the landing, and back comes
    what SwiftFlow would tell you about it. Separate from the real test:
    nothing here touches the history.
  -->
  <section id="probalo" class="px-4 py-12 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-3xl">
      <header class="mb-6 text-center">
        <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
          {{ t("landing.news.tryIt.kicker") }}
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-4xl"
        >
          {{ t("landing.news.tryIt.title") }}
        </h2>
      </header>

      <div
        v-reveal="'zoom'"
        class="relative rounded-card border-2 bg-paper-white p-5 shadow-xl shadow-primary/5 transition-[border-color] duration-200 sm:p-7"
        :class="focused && !result ? 'border-primary' : 'border-faded-gray'"
      >
        <!-- Typing -->
        <template v-if="!result">
          <div
            class="mb-3 flex items-center justify-between text-xs font-bold text-pencil-gray"
          >
            <span>{{
              t(started ? "landing.news.tryIt.keepGoing" : "landing.news.tryIt.start")
            }}</span>
            <span class="tabular-nums">{{ input.length }}/{{ text.length }}</span>
          </div>
          <p
            class="cursor-text font-mono text-xl leading-relaxed sm:text-2xl"
            @click="focus"
          >
            <span v-for="(char, index) in text" :key="index" :class="charClass(index)">{{
              char
            }}</span>
          </p>
          <!-- Where the keys actually go; the sentence above is what's shown -->
          <input
            ref="field"
            :value="input"
            type="text"
            class="absolute inset-0 h-full w-full cursor-text opacity-0"
            :aria-label="t('landing.news.tryIt.field')"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @input="onInput"
            @focus="focused = true"
            @blur="focused = false"
          />
        </template>

        <!-- What it found -->
        <div v-else class="animate-pop-in">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div v-for="stat in resultStats" :key="stat.label">
              <div class="font-display text-3xl font-black text-primary sm:text-4xl">
                {{ stat.value }}
              </div>
              <div class="text-[11px] font-bold uppercase tracking-wide text-pencil-gray">
                {{ stat.label }}
              </div>
            </div>
          </div>
          <div
            class="mt-5 flex items-start gap-3 rounded-xl bg-primary-tint/50 px-4 py-3"
          >
            <LightBulbIcon class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <div class="font-extrabold text-charcoal">{{ result.insight.text }}</div>
              <div class="text-sm font-bold text-pencil-gray">
                {{ result.insight.detail }}
              </div>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap justify-center gap-3">
            <router-link
              to="/"
              class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-5 py-2.5 font-extrabold text-white transition-[scale,background-color] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
            >
              {{ t("landing.news.tryIt.continue") }}
              <ArrowRightIcon class="h-5 w-5" />
            </router-link>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-faded-gray px-5 py-2.5 font-extrabold text-charcoal transition-[border-color,scale] duration-200 ease-spring hover:border-primary/50 active:scale-95"
              @click="another"
            >
              <ArrowPathIcon class="h-5 w-5" />
              {{ t("landing.news.tryIt.another") }}
            </button>
          </div>
        </div>
      </div>
      <p v-reveal class="mt-3 text-center text-xs font-bold text-pencil-gray">
        {{ t("landing.news.tryIt.notSaved") }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { LightBulbIcon, ArrowRightIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import { trySentences, summarizeTry } from "../tryIt";
import { t, locale, localeTag } from "@/shared/i18n";

let sentenceIndex = Math.floor(Math.random() * trySentences().length);
const text = ref(trySentences()[sentenceIndex]);
const input = ref("");
const strokes = ref([]);
const startedAt = ref(null);
const started = computed(() => startedAt.value !== null);
const focused = ref(false);
const result = ref(null);
const field = ref(null);

const focus = () => field.value?.focus();

const charClass = (index) => {
  const caret =
    focused.value && index === input.value.length
      ? "shadow-[inset_2px_0_0_var(--color-primary)]"
      : "";
  if (index >= input.value.length) return `text-pencil-gray ${caret}`;
  return input.value[index] === text.value[index]
    ? "font-bold text-success"
    : "rounded-sm bg-danger-tint text-danger";
};

const onInput = (event) => {
  const next = event.target.value.slice(0, text.value.length);
  const now = performance.now();
  if (startedAt.value === null && next.length) startedAt.value = now;

  // Each new character on the end is a stroke; a backspace isn't one
  for (let i = input.value.length; i < next.length; i++) {
    strokes.value.push({
      index: i,
      expected: text.value[i],
      typed: next[i],
      ms: now - startedAt.value,
    });
  }
  input.value = next;
  event.target.value = next;

  if (next.length === text.value.length) {
    result.value = summarizeTry({
      text: text.value,
      input: next,
      strokes: strokes.value,
    });
  }
};

const resultStats = computed(() => [
  { label: "wpm", value: result.value.wpm },
  { label: t("landing.news.tryIt.accuracy"), value: `${result.value.accuracy}%` },
  {
    label: t("landing.news.tryIt.seconds"),
    value: result.value.seconds.toLocaleString(localeTag()),
  },
]);

const reset = () => {
  input.value = "";
  strokes.value = [];
  startedAt.value = null;
  result.value = null;
};

const another = () => {
  sentenceIndex = (sentenceIndex + 1) % trySentences().length;
  text.value = trySentences()[sentenceIndex];
  reset();
  nextTick(focus);
};

// A change of language brings a sentence in that language
watch(locale, () => {
  text.value = trySentences()[sentenceIndex % trySentences().length];
  reset();
});
</script>
