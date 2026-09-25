<template>
  <!--
    How it works, told with the scroll: on a wide screen the stage holds
    still while scrolling walks it through the three steps. On a phone, or
    with reduced motion, the steps just stack -- a pinned stage on a small
    screen is more disorienting than telling.
  -->
  <section ref="section" class="px-4 sm:px-6" :class="pinned ? 'h-[280vh]' : 'py-16'">
    <div
      class="mx-auto max-w-6xl"
      :class="pinned ? 'sticky top-16 flex min-h-[calc(100vh-5rem)] items-center' : ''"
    >
      <div class="w-full">
        <header class="mx-auto mb-10 max-w-2xl text-center">
          <p class="text-xs font-extrabold uppercase tracking-widest text-primary">
            {{ t("landing.intro.narrative.kicker") }}
          </p>
          <h2 class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl">
            {{ t("landing.intro.narrative.title") }}
          </h2>
        </header>

        <!-- Pinned: the steps on the left, one stage on the right -->
        <div v-if="pinned" class="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ol class="space-y-3">
            <li
              v-for="(step, index) in steps"
              :key="index"
              class="flex gap-4 rounded-card border-2 p-5 transition-[opacity,border-color,background-color,scale] duration-500 ease-smooth"
              :class="
                index === active
                  ? 'border-primary/50 bg-paper-white opacity-100 shadow-lg shadow-primary/10'
                  : 'border-transparent opacity-40 scale-[0.98]'
              "
            >
              <span
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-display text-lg font-black transition-colors duration-500"
                :class="
                  index === active
                    ? 'bg-primary text-white'
                    : 'bg-faded-gray/40 text-pencil-gray'
                "
                >{{ index + 1 }}</span
              >
              <div>
                <h3 class="font-display text-xl font-extrabold text-charcoal">
                  {{ step.title }}
                </h3>
                <p class="mt-1 text-sm font-bold text-pencil-gray">{{ step.text }}</p>
              </div>
            </li>
          </ol>

          <div class="relative min-h-[18rem]">
            <Transition
              mode="out-in"
              enter-active-class="transition-[opacity,translate,scale] duration-500 ease-smooth"
              enter-from-class="opacity-0 translate-y-6 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition-[opacity,translate] duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-4"
            >
              <StepStage :key="active" :step="active" />
            </Transition>
          </div>
        </div>

        <!-- Stacked -->
        <ol v-else class="space-y-6">
          <li
            v-for="(step, index) in steps"
            :key="index"
            v-reveal
            class="rounded-card border-2 border-faded-gray bg-paper-white p-5"
          >
            <div class="mb-4 flex gap-3">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary font-display font-black text-white"
                >{{ index + 1 }}</span
              >
              <div>
                <h3 class="font-display text-lg font-extrabold text-charcoal">
                  {{ step.title }}
                </h3>
                <p class="text-sm font-bold text-pencil-gray">{{ step.text }}</p>
              </div>
            </div>
            <StepStage :step="index" />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted } from "vue";
import { prefersReducedMotion } from "@/shared/utils/motion";
import { t } from "@/shared/i18n";

const N = "landing.intro.narrative.";
const steps = computed(() => t(`${N}steps`));
const STEP_COUNT = 3;

const TYPED = "el pequeño pingüino baila con su";
const REST = " sombrero";
const REPLAY = [
  ["el", "fast"],
  ["pequeño", "stuck"],
  ["pingüino", "slow"],
  ["baila", "normal"],
  ["con", "fast"],
  ["su", "fast"],
];
const TIERS = {
  fast: "text-success",
  normal: "text-charcoal",
  slow: "bg-primary/15 text-primary-dark",
  stuck: "bg-danger/15 font-bold text-danger",
};
const DRILL = "ñaño queso señal quinta pequeño que año";

const card = (children) =>
  h(
    "div",
    {
      class:
        "rounded-card border-2 border-faded-gray bg-paper-white p-5 shadow-xl shadow-primary/5 sm:p-6",
      "aria-hidden": "true",
    },
    children
  );
const chip = (text, tone = "border-faded-gray text-charcoal") =>
  h("span", { class: `rounded-lg border-2 px-2 py-1 text-xs font-bold ${tone}` }, text);

// What each step looks like in the app, drawn small
const StepStage = (props) => {
  if (props.step === 0) {
    return card([
      h("div", { class: "mb-3 flex items-baseline gap-1" }, [
        h("span", { class: "font-display text-3xl font-black text-charcoal" }, "58"),
        h("span", { class: "text-[10px] font-bold uppercase text-pencil-gray" }, "wpm"),
      ]),
      h("p", { class: "font-mono text-xl leading-relaxed sm:text-2xl" }, [
        h("span", { class: "font-bold text-success" }, TYPED),
        h(
          "span",
          { class: "text-pencil-gray shadow-[inset_2px_0_0_var(--color-primary)]" },
          REST
        ),
      ]),
    ]);
  }
  if (props.step === 1) {
    return card([
      h(
        "p",
        { class: "font-mono text-xl leading-loose" },
        REPLAY.flatMap(([word, tier]) => [
          h("span", { class: `rounded px-0.5 ${TIERS[tier]}` }, word),
          " ",
        ])
      ),
      h("div", { class: "mt-4 flex flex-wrap gap-2" }, [
        chip(
          t(`${N}stuckOn`, "pequeño", t(`${N}stuckTime`)),
          "border-danger/30 text-danger"
        ),
        chip(t(`${N}slowestKey`, "Ñ")),
        chip(t(`${N}consistency`, 88)),
      ]),
    ]);
  }
  return card([
    h(
      "div",
      { class: "mb-3 flex items-center gap-2 text-xs font-bold text-pencil-gray" },
      [
        t(`${N}training`),
        h(
          "kbd",
          {
            class:
              "rounded-md bg-success-tint px-1.5 font-mono font-extrabold uppercase text-success-dark",
          },
          "ñ"
        ),
        h(
          "kbd",
          {
            class:
              "rounded-md bg-primary-tint px-1.5 font-mono font-extrabold uppercase text-primary",
          },
          "q"
        ),
      ]
    ),
    h(
      "p",
      { class: "font-mono text-xl leading-relaxed text-charcoal sm:text-2xl" },
      DRILL
    ),
    h("div", { class: "mt-4 flex flex-wrap gap-2" }, [
      chip(t(`${N}doneToday`, "Ñ"), "border-success/40 text-success-dark"),
      chip(t(`${N}reviewIn`, 3)),
    ]),
  ]);
};
StepStage.props = ["step"];

// Pinned only where there's room and motion is welcome
const pinned = ref(false);
const active = ref(0);
const section = ref(null);
let scroller = null;
let frame = null;

const measure = () => {
  frame = null;
  if (!section.value || !scroller) return;
  const rect = section.value.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  const travel = rect.height - view.height;
  const progress = travel > 0 ? (view.top - rect.top) / travel : 0;
  active.value = Math.min(STEP_COUNT - 1, Math.max(0, Math.floor(progress * STEP_COUNT)));
};
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(measure);
};

onMounted(() => {
  pinned.value =
    !prefersReducedMotion() &&
    Boolean(window.matchMedia?.("(min-width: 1024px)").matches);
  if (!pinned.value) return;
  scroller = section.value?.closest(".overflow-y-auto") ?? null;
  scroller?.addEventListener("scroll", onScroll, { passive: true });
  measure();
});

onUnmounted(() => {
  scroller?.removeEventListener("scroll", onScroll);
  if (frame) cancelAnimationFrame(frame);
});
</script>
