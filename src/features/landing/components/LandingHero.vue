<template>
  <section class="relative overflow-hidden px-4 sm:px-6">
    <!-- Slow-drifting color, in the accent the visitor has picked -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="landing-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
        :style="{ transform: `translateY(${parallax * 0.25}px)` }"
      ></div>
      <div
        class="landing-blob landing-blob-slow absolute -right-16 top-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
        :style="{ transform: `translateY(${parallax * -0.15}px)` }"
      ></div>
    </div>

    <div
      class="mx-auto grid max-w-6xl items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
    >
      <div class="text-center lg:text-left">
        <!-- Someone who's played: where they're at, instead of the pitch -->
        <div
          v-if="returning"
          v-reveal
          class="mb-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border-2 border-primary/30 bg-primary-tint/40 px-4 py-2.5 text-sm font-bold text-charcoal lg:justify-start"
        >
          <span class="font-extrabold text-primary">{{
            t("landing.intro.hero.hello")
          }}</span>
          <span>{{ t("landing.intro.hero.sessions", historyStore.sessionsCount) }}</span>
          <span v-if="historyStore.dailyStreak" class="inline-flex items-center gap-1">
            <FireIcon class="h-4 w-4 text-primary" />
            {{ t("landing.intro.hero.streak", historyStore.dailyStreak) }}
          </span>
          <span>{{
            t(
              "landing.intro.hero.level",
              historyStore.level.level,
              historyStore.level.title
            )
          }}</span>
          <span v-if="weakKey">
            {{ t("landing.intro.hero.weakKey") }}
            <kbd
              class="rounded-md border-2 border-danger/30 bg-danger-tint px-1.5 font-mono font-extrabold uppercase text-danger"
              >{{ weakKey }}</kbd
            >
          </span>
        </div>
        <p
          v-else
          v-reveal
          class="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary-tint/50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary"
        >
          <BoltIcon class="h-4 w-4" />
          {{ t("landing.intro.hero.badge") }}
        </p>
        <h1
          v-reveal="{ delay: 100 }"
          class="font-display text-4xl font-black leading-[1.05] text-charcoal sm:text-6xl"
        >
          {{ t("landing.intro.hero.titleTop") }}<br />
          <span class="text-primary">{{ t("landing.intro.hero.titleBottom") }}</span>
        </h1>
        <p
          v-reveal="{ delay: 200 }"
          class="mx-auto mt-6 max-w-xl text-base font-bold text-pencil-gray sm:text-lg lg:mx-0"
        >
          {{ t("landing.intro.hero.intro") }}
        </p>
        <div
          v-reveal="{ delay: 300 }"
          class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          <router-link
            to="/"
            class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-6 py-3 font-extrabold text-white transition-[scale,background-color] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
          >
            {{
              t(returning ? "landing.intro.hero.continue" : "landing.intro.hero.start")
            }}
            <ArrowRightIcon class="h-5 w-5" />
          </router-link>
          <!-- Only where the browser offers it, and not once installed -->
          <button
            v-if="installPrompt && !isInstalled"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border-2 border-primary/50 px-6 py-3 font-extrabold text-primary transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-tint active:scale-95"
            @click="promptInstall"
          >
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("landing.intro.hero.install") }}
          </button>
          <a
            href="#que-tiene"
            class="inline-flex items-center gap-2 rounded-xl border-2 border-faded-gray px-6 py-3 font-extrabold text-charcoal transition-[border-color,scale] duration-200 ease-spring hover:border-primary/50 active:scale-95"
            @click.prevent="emit('explore')"
          >
            {{ t("landing.intro.hero.explore") }}
            <ArrowDownIcon class="h-5 w-5" />
          </a>
        </div>
        <p
          v-reveal="{ variant: 'fade-in', delay: 500 }"
          class="mt-4 hidden text-xs font-bold text-pencil-gray sm:block"
        >
          {{ t("landing.intro.hero.orPress") }}
          <kbd
            class="rounded-md border-2 border-faded-gray bg-paper-white px-1.5 py-0.5 font-mono text-charcoal"
            >{{ t("landing.intro.hero.space") }}</kbd
          >
          {{ t("landing.intro.hero.toStart") }}
        </p>
      </div>

      <div v-reveal="{ variant: 'zoom', delay: 250 }">
        <div v-tilt="4">
          <TypingDemo />
        </div>
      </div>
    </div>

    <!-- The numbers, counting up when they come into view -->
    <InView min-height="6rem" class="mx-auto max-w-5xl pb-10">
      <dl class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div
          v-for="(stat, index) in STATS"
          :key="stat.id"
          class="flex flex-col-reverse rounded-card border-2 border-faded-gray bg-paper-white/70 px-3 py-4 text-center backdrop-blur-sm animate-rise"
          :class="{ 'col-span-2 sm:col-span-1': index === STATS.length - 1 }"
          :style="staggerStyle(index, { step: 80 })"
        >
          <!-- Label first for screen readers; shown under the number -->
          <dt class="text-[11px] font-bold uppercase tracking-wide text-pencil-gray">
            {{ stat.label }}
          </dt>
          <dd class="font-display text-3xl font-black text-charcoal">
            <AnimatedNumber :value="stat.value" :duration="1200" />
          </dd>
        </div>
      </dl>
    </InView>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  BoltIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";
import { FireIcon } from "@heroicons/vue/24/solid";
import { useHistoryStore } from "@/features/history/store";
import { suggestedDrillKeys } from "@/features/typing-test/utils/drillTargets";
import { installPrompt, isInstalled, promptInstall } from "@/shared/utils/pwaInstall";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import { staggerStyle } from "@/shared/utils/motion";
import { useConfigStore } from "@/features/typing-test/store";
import { codeLanguages } from "@/features/typing-test/content/code";
import { ACHIEVEMENTS } from "@/features/history/achievements";
import { MAX_LEVEL } from "@/features/history/utils/experience";
import TypingDemo from "./TypingDemo.vue";
import InView from "./InView.vue";
import { t } from "@/shared/i18n";

defineProps({
  // How far the page has scrolled, for the background's slow drift
  parallax: { type: Number, default: 0 },
});

const emit = defineEmits(["explore"]);

const historyStore = useHistoryStore();
const returning = computed(() => historyStore.sessionsCount > 0);
// The letter the history most wants practiced, once there's enough to say
const weakKey = computed(() => suggestedDrillKeys(historyStore.results)[0] ?? null);

// Counted from the app itself, so the page never falls behind it
const STATS = [
  { id: "modes", value: useConfigStore().types.length },
  { id: "codeLanguages", value: codeLanguages.length },
  { id: "achievements", value: ACHIEVEMENTS.length },
  { id: "levels", value: MAX_LEVEL },
  { id: "accounts", value: 0 },
].map((stat) => ({
  ...stat,
  get label() {
    return t(`landing.intro.hero.stats.${stat.id}`);
  },
}));
</script>

<style scoped>
/* The background color drifting, slowly enough to feel alive, not busy */
@keyframes blob-drift {
  0%,
  100% {
    translate: 0 0;
    scale: 1;
  }
  50% {
    translate: 30px -20px;
    scale: 1.08;
  }
}

.landing-blob {
  animation: blob-drift 14s ease-in-out infinite;
}

.landing-blob-slow {
  animation-duration: 19s;
  animation-direction: reverse;
}
</style>
