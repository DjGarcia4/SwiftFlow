<template>
  <div>
    <!-- Questions -->
    <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h2
        v-reveal
        class="mb-8 text-center font-display text-3xl font-black text-charcoal sm:text-4xl"
      >
        Preguntas
      </h2>
      <div v-reveal.stagger="{ step: 70 }" class="space-y-3">
        <details
          v-for="faq in FAQS"
          :key="faq.question"
          class="group rounded-card border-2 border-faded-gray bg-paper-white px-5 py-4 transition-[border-color] duration-200 open:border-primary/40"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-charcoal"
          >
            {{ faq.question }}
            <ChevronDownIcon
              class="h-5 w-5 flex-shrink-0 text-pencil-gray transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <p class="mt-3 text-sm font-bold text-pencil-gray">{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <!-- Last call -->
    <section class="px-4 py-16 sm:px-6 sm:py-24">
      <div
        v-reveal="'zoom'"
        class="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-white shadow-2xl shadow-primary/30 sm:px-12"
      >
        <div class="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div
            class="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/40 blur-3xl"
          ></div>
          <div
            class="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-white/30 blur-3xl"
          ></div>
        </div>
        <h2 class="relative font-display text-3xl font-black sm:text-5xl">
          Tu primera partida tarda 15 segundos
        </h2>
        <p class="relative mx-auto mt-4 max-w-xl font-bold text-white/85">
          Sin registrarte, sin instalar nada. Escribí y mirá qué te dice.
        </p>
        <router-link
          to="/"
          class="relative mt-8 inline-flex items-center gap-2 rounded-xl border-b-4 border-black/20 bg-white px-7 py-3.5 font-extrabold text-primary transition-[scale] duration-200 ease-spring hover:scale-105 active:scale-95"
        >
          Empezar ahora
          <ArrowRightIcon class="h-5 w-5" />
        </router-link>
      </div>
    </section>

    <!-- Foot -->
    <footer class="border-t-2 border-faded-gray/60 px-4 py-8 sm:px-6">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm font-bold text-pencil-gray sm:flex-row"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-lg border-b-2 border-primary-dark bg-primary"
          >
            <BoltIcon class="h-4 w-4 text-white" />
          </span>
          <span class="font-display font-extrabold text-charcoal">SwiftFlow</span>
          <span>· mecanografía en español</span>
        </div>
        <nav class="flex gap-5" aria-label="Pie de página">
          <router-link to="/" class="hover:text-primary">Escribir</router-link>
          <router-link to="/historial" class="hover:text-primary">Historial</router-link>
          <a href="#top" class="hover:text-primary" @click.prevent="emit('top')"
            >Arriba</a
          >
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { BoltIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits(["top"]);

const FAQS = [
  {
    question: "¿Necesito crear una cuenta?",
    answer:
      "No. Abrís la página y escribís. Todo lo que SwiftFlow sabe de vos queda en tu navegador.",
  },
  {
    question: "¿Dónde se guardan mis datos?",
    answer:
      "En tu navegador, en este dispositivo, y en ningún otro lado. Desde el historial podés exportarlos a un archivo e importarlos en otro dispositivo.",
  },
  {
    question: "¿Funciona sin internet?",
    answer:
      "Sí. Es una app web instalable: una vez abierta, anda sin conexión, y la podés agregar a tu pantalla de inicio o a tu escritorio.",
  },
  {
    question: "¿Qué distribución de teclado usa?",
    answer:
      "La española: con Ñ, tildes y los signos de apertura. El teclado en pantalla y los colores por dedo siguen la digitación estándar al tacto.",
  },
  {
    question: "¿Cómo se calcula el WPM?",
    answer:
      "Como en Monkeytype: solo cuentan las palabras completas y correctas, a cinco caracteres por palabra. Aparte ves el WPM bruto, que cuenta todo lo que tecleaste.",
  },
  {
    question: "¿Es gratis?",
    answer: "Sí, completo. No hay versión paga ni publicidad.",
  },
];
</script>
