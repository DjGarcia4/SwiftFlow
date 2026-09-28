<template>
  <!-- One chapter of the history: its number, its name, one line on what
       it shows, and then the cards themselves -->
  <section
    :id="id"
    :aria-labelledby="`${id}-title`"
    data-chapter
    class="scroll-mt-20 lg:scroll-mt-6 mb-12"
  >
    <header class="mb-4 flex items-start gap-3">
      <span
        class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-tint font-display text-sm font-black text-primary"
        aria-hidden="true"
        >{{ number }}</span
      >
      <div class="min-w-0">
        <h2
          :id="`${id}-title`"
          class="font-display text-xl sm:text-2xl font-extrabold text-charcoal"
        >
          {{ title }}
        </h2>
        <p class="mt-0.5 text-sm font-bold text-pencil-gray">{{ intro }}</p>
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  intro: { type: String, default: "" },
});
</script>
