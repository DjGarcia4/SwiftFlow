<template>
  <!--
    The dictation's controls, above the hidden text: listen (and listen
    again), how fast the voice goes, and which sentence this is. Each
    sentence is read out as the one before it is finished.
  -->
  <!-- Above the invisible textarea that covers the typing area, or none of
       this could be clicked -->
  <div class="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
    <template v-if="voiceState === 'ready'">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border-b-4 px-4 py-2 text-sm font-extrabold transition-[background-color,scale] duration-200 ease-spring active:scale-95"
        :class="
          listened
            ? 'border-faded-gray bg-faded-gray/25 text-charcoal hover:bg-faded-gray/40'
            : 'border-primary-dark bg-primary text-white hover:bg-primary-dark'
        "
        @click="listen"
      >
        <SpeakerWaveIcon v-if="!listened" class="h-5 w-5" />
        <ArrowPathIcon v-else class="h-5 w-5" />
        {{ listened ? "Repetir" : "Escuchar" }}
        <kbd
          class="hidden rounded-md border-2 border-current/30 px-1.5 font-mono text-[10px] opacity-80 sm:inline"
          >Enter</kbd
        >
      </button>
      <SegmentedControl
        label="Velocidad de la voz"
        :options="RATE_OPTIONS"
        :model-value="configStore.dictationRate"
        @select="pickRate"
      />
      <span class="text-xs font-bold text-pencil-gray tabular-nums">
        Frase {{ current + 1 }} de {{ sentences.length }}
      </span>
    </template>
    <p v-else-if="voiceState === 'loading'" class="text-sm font-bold text-pencil-gray">
      Buscando una voz en español…
    </p>
    <p v-else class="text-sm font-bold text-danger" role="alert">
      Tu navegador no tiene una voz en español. Probá con otro navegador, o instalá una
      voz en español desde los ajustes de tu sistema.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { SpeakerWaveIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { DICTATION_RATES } from "@/features/typing-test/configRepository";
import { sentenceIndexAt } from "@/features/typing-test/content/dictation";
import { loadVoices, pickSpanishVoice, speak, stopSpeaking } from "@/shared/utils/speech";

const configStore = useConfigStore();

const RATE_OPTIONS = [
  { value: "slow", label: "Lenta" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Rápida" },
];

// Browsers only let a page speak after it's been interacted with. Once
// someone has pressed "Escuchar" here, every new dictation this visit
// starts talking on its own.
let listenedThisVisit = false;

const voice = ref(null);
const voiceState = ref("loading");
const listened = ref(false);

const sentences = computed(() => configStore.dictation?.sentences ?? []);
const current = computed(() =>
  sentenceIndexAt(configStore.dictation?.starts ?? [0], configStore.userInput.length)
);

const say = (index) => {
  const sentence = sentences.value[index];
  if (!sentence || !voice.value) return;
  speak(sentence, {
    voice: voice.value,
    rate: DICTATION_RATES[configStore.dictationRate],
  });
};

const refocusText = () => nextTick(() => document.querySelector("textarea")?.focus());

const listen = () => {
  listened.value = true;
  listenedThisVisit = true;
  say(current.value);
  refocusText();
};

const pickRate = (rate) => {
  configStore.setDictationRate(rate);
  // Heard again at the new pace, right away
  if (listened.value) say(current.value);
  refocusText();
};

// The next sentence, as soon as the one before it is typed
watch(current, (index, previous) => {
  if (listened.value && index > previous) say(index);
});

// A new dictation: straight to its first sentence if that's allowed yet
watch(
  () => configStore.dictation,
  () => {
    stopSpeaking();
    listened.value = listenedThisVisit;
    if (listened.value) say(0);
  }
);

// Done: the voice stops with the session
watch(
  () => configStore.isCompleted,
  (completed) => {
    if (completed) stopSpeaking();
  }
);

// Enter listens, and listens again: a dictation has no line breaks to type
const onKeydown = (event) => {
  if (event.key !== "Enter" || configStore.isCompleted || voiceState.value !== "ready") {
    return;
  }
  if (event.target?.closest?.("button, a[href], select, [role='dialog']")) return;
  event.preventDefault();
  listen();
};

onMounted(async () => {
  document.addEventListener("keydown", onKeydown, true);
  voice.value = pickSpanishVoice(await loadVoices(), navigator.languages ?? []);
  voiceState.value = voice.value ? "ready" : "missing";
  if (voice.value && listenedThisVisit) listen();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown, true);
  stopSpeaking();
});
</script>
