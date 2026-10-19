<template>
  <!--
    The offset: twelve clicks, Space on each from the fifth, and the median
    of how far off they landed is what every press gets moved by. Or by
    hand, five ms at a time.
  -->
  <div
    class="flex flex-col items-center justify-center gap-3 bg-paper-white/95 px-6 text-center backdrop-blur-[2px]"
    role="group"
    :aria-label="t('rhythm.calibration.heading')"
    data-rhythm-calibration
  >
    <h2 class="text-subheading font-display font-extrabold text-charcoal">
      {{ t("rhythm.calibration.heading") }}
    </h2>
    <p class="max-w-md text-sm text-pencil-gray">{{ t("rhythm.calibration.body") }}</p>

    <!-- The beat, as twelve dots that light as the clicks go by -->
    <div class="flex gap-1.5" aria-hidden="true">
      <span
        v-for="beat in CLICKS"
        :key="beat"
        class="h-3 w-3 rounded-full transition-[background-color,scale] duration-100"
        :class="
          beat > clicked
            ? 'bg-faded-gray/60'
            : beat > WARMUP
              ? 'scale-110 bg-primary'
              : 'scale-110 bg-pencil-gray'
        "
      ></span>
    </div>

    <p
      v-if="state === 'listening'"
      class="font-mono text-sm font-bold text-charcoal"
      aria-live="polite"
    >
      {{ t("rhythm.calibration.listening", Math.max(1, clicked)) }}
    </p>
    <p
      v-else-if="state === 'measured'"
      class="rounded-xl bg-success-tint px-3 py-1 text-sm font-bold text-success-dark"
      aria-live="polite"
    >
      {{ t("rhythm.calibration.result", rhythm.offset) }}
    </p>
    <p
      v-else-if="state === 'failed'"
      class="rounded-xl bg-danger-tint px-3 py-1 text-sm font-bold text-danger"
      aria-live="polite"
    >
      {{ t("rhythm.calibration.failed") }}
    </p>

    <IconButton
      v-if="state !== 'listening'"
      icon="play"
      size="sm"
      :text="t('rhythm.calibration.start')"
      @click="listen"
    />

    <div class="flex items-center gap-2 text-xs font-bold text-pencil-gray">
      <span>{{ t("rhythm.calibration.manual") }}</span>
      <IconButton
        icon="minus"
        variant="secondary"
        size="xs"
        tooltip="-5 ms"
        @click="rhythm.setOffset(rhythm.offset - 5)"
      />
      <span class="w-28 font-mono text-charcoal">{{
        t("rhythm.toolbar.offset", rhythm.offset)
      }}</span>
      <IconButton
        icon="plus"
        variant="secondary"
        size="xs"
        tooltip="+5 ms"
        @click="rhythm.setOffset(rhythm.offset + 5)"
      />
      <IconButton
        variant="secondary"
        size="xs"
        :text="t('rhythm.calibration.reset')"
        @click="rhythm.setOffset(0)"
      />
    </div>

    <IconButton
      icon="check"
      variant="secondary"
      size="sm"
      :text="t('rhythm.calibration.done')"
      data-rhythm-calibration-done
      @click="close"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { t } from "@/shared/i18n";
import IconButton from "@/shared/components/IconButton.vue";
import { useRhythmStore } from "@/features/rhythm/store";
import { createPlayer } from "@/features/rhythm/synth";
import {
  trackTimeline,
  BEATS_PER_BAR,
  INTRO_BARS,
  OUTRO_BARS,
} from "@/features/rhythm/tracks";

const emit = defineEmits(["close"]);

const rhythm = useRhythmStore();

// No bars of its own: just the intro and the outro, a click on each beat
const CLICK_TRACK = { id: "calibration", bpm: 100, bars: 0, chords: [[60]], bass: [48] };
const CLICKS = (INTRO_BARS + OUTRO_BARS) * BEATS_PER_BAR;
// The first clicks are to catch the beat
const WARMUP = 4;
const { beatMs, durationMs } = trackTimeline(CLICK_TRACK);

// "ready", "listening", "measured" or "failed"
const state = ref("ready");
const clicked = ref(0);
let player = null;
let frame = null;
let deltas = [];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const stop = () => {
  cancelAnimationFrame(frame);
  player?.stop();
  player = null;
};

const tick = () => {
  const now = player.now();
  clicked.value = Math.max(0, Math.min(CLICKS, Math.floor(now / beatMs) + 1));
  if (now < durationMs) {
    frame = requestAnimationFrame(tick);
    return;
  }
  stop();
  // Half the clicks after the warmup, at least, to trust it
  if (deltas.length >= (CLICKS - WARMUP) / 2) {
    rhythm.setOffset(median(deltas));
    state.value = "measured";
  } else {
    state.value = "failed";
  }
};

const listen = () => {
  stop();
  deltas = [];
  clicked.value = 0;
  player = createPlayer(CLICK_TRACK, { pattern: false });
  player.start(300);
  state.value = "listening";
  frame = requestAnimationFrame(tick);
};

const close = () => {
  stop();
  emit("close");
};

const onKeydown = (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== " " || state.value !== "listening" || event.repeat) return;
  event.preventDefault();
  const at = player.now() - (performance.now() - event.timeStamp);
  const beat = Math.round(at / beatMs);
  const delta = at - beat * beatMs;
  if (beat >= WARMUP && beat < CLICKS && Math.abs(delta) < beatMs / 2) deltas.push(delta);
};

onMounted(() => document.addEventListener("keydown", onKeydown, true));
onUnmounted(() => {
  stop();
  document.removeEventListener("keydown", onKeydown, true);
});
</script>
