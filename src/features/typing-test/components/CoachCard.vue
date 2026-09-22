<template>
  <div
    class="flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-paper-white px-3.5 py-3 shadow-lg shadow-primary/10"
  >
    <div
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary"
    >
      <ViewfinderCircleIcon class="w-5 h-5" />
    </div>

    <div class="min-w-0 flex-1 text-left">
      <div class="flex items-center gap-1.5">
        <span class="text-sm font-extrabold text-charcoal">{{ coach.title }}</span>
        <kbd
          v-for="key in coach.keys"
          :key="key"
          class="hidden xs:inline-block px-1.5 py-0.5 bg-danger-tint text-danger rounded-md font-mono text-xs font-extrabold border-2 border-danger/30"
          >{{ key.toUpperCase() }}</kbd
        >
      </div>
      <div class="text-xs text-pencil-gray mt-0.5">{{ coach.detail }}</div>
    </div>

    <button
      type="button"
      class="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold text-white border-b-2 border-primary-dark transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
      @click="emit('train', coach.keys)"
    >
      <BoltIcon class="w-3.5 h-3.5" />
      Entrenar ahora
    </button>

    <button
      v-if="dismissible"
      type="button"
      class="flex-shrink-0 -mr-1 rounded-md p-1 text-pencil-gray hover:text-charcoal"
      aria-label="Ocultar"
      @click="emit('dismiss')"
    >
      <XMarkIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ViewfinderCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { BoltIcon } from "@heroicons/vue/24/solid";

defineProps({
  // { keys, title, detail }, as computeLiveCoach returns it
  coach: { type: Object, required: true },
  dismissible: { type: Boolean, default: false },
});

const emit = defineEmits(["train", "dismiss"]);
</script>
