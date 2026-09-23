<template>
  <!--
    The landing: what SwiftFlow is and everything it does, for someone who
    hasn't seen it. The typing test stays at "/". Sections come in with
    v-reveal as they're scrolled to, and the app's own charts are mounted
    when they arrive (InView), so they draw themselves in front of whoever
    is looking.
  -->
  <div ref="root" class="relative">
    <!-- How far down the page you are, in the accent color -->
    <div
      class="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-primary"
      :style="{ transform: `scaleX(${progress})` }"
      aria-hidden="true"
    ></div>

    <LandingHero :parallax="parallax" @explore="scrollToId('que-tiene')" />
    <FeatureGrid />
    <StatsShowcase />
    <ProgressShowcase />
    <LandingClosing @top="scrollToTop" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { prefersReducedMotion } from "@/shared/utils/motion";
import LandingHero from "@/features/landing/components/LandingHero.vue";
import FeatureGrid from "@/features/landing/components/FeatureGrid.vue";
import StatsShowcase from "@/features/landing/components/StatsShowcase.vue";
import ProgressShowcase from "@/features/landing/components/ProgressShowcase.vue";
import LandingClosing from "@/features/landing/components/LandingClosing.vue";

const router = useRouter();
const root = ref(null);

// The app scrolls inside its own container, not the window
let scroller = null;
const progress = ref(0);
const parallax = ref(0);
let frame = null;

const measure = () => {
  frame = null;
  if (!scroller) return;
  const max = scroller.scrollHeight - scroller.clientHeight;
  progress.value = max > 0 ? scroller.scrollTop / max : 0;
  // The hero's background drifts a little slower than the page
  parallax.value = prefersReducedMotion() ? 0 : Math.min(scroller.scrollTop, 800);
};
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(measure);
};

const behavior = () => (prefersReducedMotion() ? "auto" : "smooth");
const scrollToId = (id) => {
  const target = document.getElementById(id);
  if (!target || !scroller) return;
  const top =
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop;
  scroller.scrollTo({ top: top - 16, behavior: behavior() });
};
const scrollToTop = () => scroller?.scrollTo({ top: 0, behavior: behavior() });

// Space goes to typing from here, as it does from the history. Not in a
// field, nor on a focused button or question, which space presses. A
// focused link is fine: links take Enter, and arriving here from the nav
// leaves one focused.
const handleKeydown = (event) => {
  if (event.key !== " " || event.repeat) return;
  if (
    event.target?.closest?.(
      "input, textarea, select, button, summary, [contenteditable='true']"
    )
  ) {
    return;
  }
  event.preventDefault();
  router.push("/");
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  scroller = root.value?.closest(".overflow-y-auto") ?? null;
  scroller?.addEventListener("scroll", onScroll, { passive: true });
  measure();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  scroller?.removeEventListener("scroll", onScroll);
  if (frame) cancelAnimationFrame(frame);
});
</script>
