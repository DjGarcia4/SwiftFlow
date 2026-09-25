<template>
  <!--
    What a typical speed test tells you, next to what SwiftFlow does. About
    what gets measured, not about anyone in particular: no names, and no
    claims about other products.
  -->
  <section class="px-4 py-16 sm:px-6 sm:py-20">
    <div class="mx-auto max-w-4xl">
      <header class="mx-auto mb-10 max-w-2xl text-center">
        <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
          {{ t("landing.intro.comparison.kicker") }}
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
        >
          {{ t("landing.intro.comparison.title") }}
        </h2>
      </header>

      <div
        v-reveal="'fade-up'"
        class="overflow-hidden rounded-card border-2 border-faded-gray bg-paper-white"
      >
        <table class="w-full text-left">
          <thead>
            <tr
              class="border-b-2 border-faded-gray text-xs font-extrabold uppercase tracking-wide"
            >
              <th scope="col" class="px-4 py-3 text-pencil-gray sm:px-6">
                {{ t("landing.intro.comparison.after") }}
              </th>
              <th scope="col" class="w-24 px-2 py-3 text-center text-pencil-gray sm:w-36">
                {{ t("landing.intro.comparison.typical") }}
              </th>
              <th
                scope="col"
                class="w-24 bg-primary-tint/50 px-2 py-3 text-center text-primary sm:w-36"
              >
                SwiftFlow
              </th>
            </tr>
          </thead>
          <tbody v-reveal.stagger="{ step: 60 }">
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="border-b border-faded-gray/60 last:border-b-0"
            >
              <th scope="row" class="px-4 py-3 text-sm font-bold text-charcoal sm:px-6">
                {{ row.label }}
              </th>
              <td class="px-2 py-3 text-center">
                <CheckIcon v-if="row.typical" class="mx-auto h-5 w-5 text-pencil-gray" />
                <MinusIcon v-else class="mx-auto h-5 w-5 text-faded-gray" />
                <span class="sr-only">{{
                  t(
                    row.typical
                      ? "landing.intro.comparison.yes"
                      : "landing.intro.comparison.no"
                  )
                }}</span>
              </td>
              <td class="bg-primary-tint/30 px-2 py-3 text-center">
                <CheckIcon class="mx-auto h-5 w-5 text-primary" />
                <span class="sr-only">{{ t("landing.intro.comparison.yes") }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { CheckIcon, MinusIcon } from "@heroicons/vue/24/outline";
import { t } from "@/shared/i18n";

// Only the first ones -- speed and accuracy -- are what a typical test gives
const TYPICAL_ROWS = 2;
const rows = computed(() =>
  t("landing.intro.comparison.rows").map((label, index) => ({
    label,
    typical: index < TYPICAL_ROWS,
  }))
);
</script>
