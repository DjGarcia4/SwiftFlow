<template>
  <!--
    For someone who hasn't played yet: the course is the place to start if
    typing without looking is new. Where the streak warning goes, which a
    first-timer never has; on desktop in the free bottom-left corner, clear
    of the buttons under the text. Gone once typing starts, and for good
    once closed.
  -->
  <div
    class="fixed bottom-20 left-4 right-4 z-30 flex justify-center sm:bottom-6 sm:left-6 sm:right-auto sm:w-96"
  >
    <div
      class="flex w-full max-w-md items-center gap-3 rounded-card border-2 border-primary/50 bg-paper-white px-4 py-3 shadow-xl animate-pop-in"
    >
      <AcademicCapIcon class="h-6 w-6 flex-shrink-0 text-primary" />
      <RouterLink to="/curso" class="min-w-0 flex-1 group">
        <span class="block text-sm font-extrabold text-charcoal group-hover:text-primary">
          ¿Recién empezás?
        </span>
        <span class="block text-xs font-bold text-pencil-gray">
          Aprendé a escribir sin mirar, una fila por vez →
        </span>
      </RouterLink>
      <button
        type="button"
        class="flex-shrink-0 rounded-md p-1 text-pencil-gray hover:text-charcoal"
        aria-label="No, gracias"
        @click="emit('dismiss')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { AcademicCapIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["dismiss"]);
</script>
