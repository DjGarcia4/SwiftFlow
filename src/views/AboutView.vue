<template>
  <!--
    The landing: what SwiftFlow is and everything it does. The typing test
    stays at "/"; this is the page to send someone who hasn't seen it.
    Sections fill in phase by phase (see the plan); each comes in with
    v-reveal as it's scrolled to.
  -->
  <div class="px-4 sm:px-6">
    <!-- Hero -->
    <section
      class="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center py-16 text-center"
    >
      <p
        v-reveal
        class="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary-tint/50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary"
      >
        <BoltIcon class="h-4 w-4" />
        Mecanografía en español
      </p>
      <h1
        v-reveal="{ delay: 100 }"
        class="font-display text-4xl font-black leading-tight text-charcoal sm:text-6xl"
      >
        Escribí más rápido.<br />
        <span class="text-primary">Entendé por qué te equivocás.</span>
      </h1>
      <p
        v-reveal="{ delay: 200 }"
        class="mt-5 max-w-2xl text-base font-bold text-pencil-gray sm:text-lg"
      >
        SwiftFlow no solo te mide: te dice qué teclas, qué palabras y qué momentos te
        frenan, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.
      </p>
      <div v-reveal="{ delay: 300 }" class="mt-8 flex flex-wrap justify-center gap-3">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-6 py-3 font-extrabold text-white transition-[scale,background-color] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
        >
          Empezar a escribir
          <ArrowRightIcon class="h-5 w-5" />
        </router-link>
      </div>
      <p
        v-reveal="{ variant: 'fade-in', delay: 500 }"
        class="mt-4 hidden text-xs font-bold text-pencil-gray sm:block"
      >
        o apretá
        <kbd
          class="rounded-md border-2 border-faded-gray bg-paper-white px-1.5 py-0.5 font-mono text-charcoal"
          >ESPACIO</kbd
        >
      </p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { BoltIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

// Space goes to typing from here, as it does from the history. Not in a
// field, nor on a focused button, which space presses. A focused link is
// fine: links take Enter, and arriving here from the nav leaves one focused.
const handleKeydown = (event) => {
  if (event.key !== " " || event.repeat) return;
  if (
    event.target?.closest?.("input, textarea, select, button, [contenteditable='true']")
  ) {
    return;
  }
  event.preventDefault();
  router.push("/");
};

onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
</script>
