<template>
  <!--
    Mounts its content the first time it's scrolled to. The app's own
    charts and grids animate as they mount, so shown on the landing
    they'd play their entrance off screen at page load; mounted here,
    they play it in front of whoever is looking. Holds its height until
    then, so the page doesn't jump.
  -->
  <div ref="root" :style="seen ? null : { minHeight }">
    <slot v-if="seen" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { prefersReducedMotion } from "@/shared/utils/motion";

defineProps({
  // Room to keep while it's waiting
  minHeight: { type: String, default: "8rem" },
});

const root = ref(null);
const seen = ref(false);
let observer = null;

onMounted(() => {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    seen.value = true;
    return;
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      seen.value = true;
      observer.disconnect();
    },
    { threshold: 0.2 }
  );
  observer.observe(root.value);
});

onUnmounted(() => observer?.disconnect());
</script>
