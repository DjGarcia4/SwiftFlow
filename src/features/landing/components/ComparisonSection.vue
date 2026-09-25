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
          La diferencia
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
        >
          Lo que un test de velocidad no te dice
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
                Qué sabés después
              </th>
              <th scope="col" class="w-24 px-2 py-3 text-center text-pencil-gray sm:w-36">
                Un test típico
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
              v-for="row in ROWS"
              :key="row.label"
              class="border-b border-faded-gray/60 last:border-b-0"
            >
              <th scope="row" class="px-4 py-3 text-sm font-bold text-charcoal sm:px-6">
                {{ row.label }}
              </th>
              <td class="px-2 py-3 text-center">
                <CheckIcon v-if="row.typical" class="mx-auto h-5 w-5 text-pencil-gray" />
                <MinusIcon v-else class="mx-auto h-5 w-5 text-faded-gray" />
                <span class="sr-only">{{ row.typical ? "sí" : "no" }}</span>
              </td>
              <td class="bg-primary-tint/30 px-2 py-3 text-center">
                <CheckIcon class="mx-auto h-5 w-5 text-primary" />
                <span class="sr-only">sí</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { CheckIcon, MinusIcon } from "@heroicons/vue/24/outline";

const ROWS = [
  { label: "Cuántas palabras por minuto escribiste", typical: true },
  { label: "Qué porcentaje de teclas acertaste", typical: true },
  { label: "Qué teclas fallás más, en proporción", typical: false },
  { label: "Qué teclas mejoraron y cuáles empeoraron", typical: false },
  { label: "Qué tecla apretás cuando errás otra", typical: false },
  { label: "Qué letras invertís por adelantarte", typical: false },
  { label: "Qué teclas y combinaciones te frenan sin que las erres", typical: false },
  { label: "Qué palabras enteras se te traban", typical: false },
  { label: "Qué dedo falla más", typical: false },
  { label: "En qué palabra de la partida te trabaste", typical: false },
  { label: "Qué tan parejo es tu ritmo", typical: false },
  { label: "Cuándo parar de entrenar, y cuándo repasar", typical: false },
];
</script>
