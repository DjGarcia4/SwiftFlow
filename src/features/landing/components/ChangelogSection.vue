<template>
  <!-- What's new: so it shows the project is alive -->
  <section class="px-4 py-16 sm:px-6 sm:py-20">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p
            v-reveal
            class="text-xs font-extrabold uppercase tracking-widest text-primary"
          >
            {{ t("landing.news.changelog.kicker") }}
          </p>
          <h2
            v-reveal="{ delay: 100 }"
            class="mt-2 font-display text-3xl font-black text-charcoal sm:text-4xl"
          >
            {{ t("landing.news.changelog.title") }}
          </h2>
        </div>
        <p v-reveal="{ delay: 150 }" class="text-sm font-bold text-pencil-gray">
          {{ formatChangelogDate(CHANGELOG[0].date) }}
        </p>
      </header>

      <ol
        v-reveal.stagger="{ step: 70 }"
        class="relative space-y-3 border-l-2 border-faded-gray pl-6"
      >
        <li v-for="(entry, index) in shown" :key="entry.id" class="relative">
          <!-- A dot on the line; the newest one pulses -->
          <span
            class="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper-white"
            :class="index === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-faded-gray'"
          ></span>
          <div class="flex flex-wrap items-baseline gap-x-2">
            <h3 class="font-extrabold text-charcoal">{{ entry.title }}</h3>
            <span
              v-if="index === 0"
              class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-white"
              >{{ t("landing.news.changelog.new") }}</span
            >
          </div>
          <p class="text-sm font-bold text-pencil-gray">{{ entry.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { CHANGELOG, formatChangelogDate } from "../changelog";
import { t } from "@/shared/i18n";

const SHOWN = 6;
const shown = CHANGELOG.slice(0, SHOWN);
</script>
