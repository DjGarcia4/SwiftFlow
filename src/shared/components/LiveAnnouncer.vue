<template>
  <!-- Heard, never seen: see announcer.js -->
  <div id="announcer-polite" class="sr-only" aria-live="polite" aria-relevant="additions">
    <p v-for="line in announcements.polite" :key="line.id">{{ line.text }}</p>
  </div>
  <div
    id="announcer-assertive"
    class="sr-only"
    aria-live="assertive"
    aria-relevant="additions"
  >
    <p v-for="line in announcements.assertive" :key="line.id">{{ line.text }}</p>
  </div>
</template>

<script setup>
import { announcements } from "@/shared/utils/announcer";
</script>
