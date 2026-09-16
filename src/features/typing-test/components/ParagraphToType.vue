<template>
  <div
    class="fixed top-1/2 left-1/2 z-0 w-full max-w-4xl lg:max-w-5xl -translate-x-1/2 -translate-y-1/2 space-y-6 px-4 sm:px-6 max-h-[min(85vh,calc(100vh-9rem))] overflow-y-auto"
    :style="viewportStyle"
  >
    <!-- Author attribution for quote mode -->
    <Transition
      enter-active-class="transition-all duration-700 ease-smooth"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <p
        v-if="isCompleted && configStore.type === 'quote' && currentQuoteAuthor"
        class="text-center text-sm sm:text-base font-bold text-pencil-gray"
      >
        — {{ currentQuoteAuthor }}
      </p>
      <p
        v-else-if="isCompleted && configStore.type === 'code' && currentCodeLanguage"
        class="text-center text-sm sm:text-base font-bold text-pencil-gray"
      >
        {{ currentCodeLanguage }}
      </p>
    </Transition>

    <!-- New-record banner: the "pompous" version of the results screen -->
    <Transition
      enter-active-class="transition-all duration-700 ease-smooth"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
    >
      <div v-if="isCompleted && configStore.endedEarly" class="text-center">
        <div
          class="inline-flex items-center gap-2 bg-faded-gray/30 text-pencil-gray rounded-xl px-5 py-2.5 text-sm font-bold"
        >
          <StopIcon class="w-5 h-5" />
          Partida terminada antes de tiempo · no cuenta para el historial
        </div>
      </div>
      <div v-else-if="isCompleted && justBrokeRecord" class="text-center">
        <div
          class="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-danger text-white rounded-xl px-5 py-2.5 text-sm font-extrabold shadow-lg shadow-primary/30 animate-key-pop"
        >
          <TrophyIcon class="w-5 h-5 animate-badge-glow" />
          ¡Nuevo récord personal!
        </div>
      </div>
    </Transition>

    <!-- Main result cards: rise in one after another, numbers count up -->
    <div
      v-if="isCompleted"
      class="grid gap-4 sm:gap-6 text-center grid-cols-2 sm:grid-cols-4"
    >
      <div
        v-for="(card, index) in resultCards"
        :key="card.label"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray animate-rise"
        :style="staggerStyle(index, { step: 80, base: 80 })"
      >
        <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
          <AnimatedNumber :value="card.value" :decimals="card.decimals" />{{
            card.suffix
          }}
        </div>
        <div
          class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
        >
          {{ card.label }}
        </div>
      </div>
    </div>

    <!-- Secondary per-keystroke stats -->
    <Transition
      enter-active-class="transition-all duration-700 ease-smooth delay-150"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="isCompleted && configStore.keystrokes > 0"
        class="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm"
      >
        <div
          class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          :style="staggerStyle(0, { step: 70, base: 400 })"
        >
          <FireIcon class="w-4 h-4 text-primary" />
          <span class="font-extrabold text-charcoal">{{ configStore.maxStreak }}</span>
          <span class="text-pencil-gray font-bold">combo máx.</span>
        </div>
        <div
          class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          :style="staggerStyle(1, { step: 70, base: 400 })"
        >
          <span class="font-extrabold text-charcoal">{{ configStore.rawWpm }}</span>
          <span class="text-pencil-gray font-bold">wpm bruto</span>
        </div>
        <div
          class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          :style="staggerStyle(2, { step: 70, base: 400 })"
        >
          <span class="font-extrabold text-charcoal">{{ correctedErrors }}</span>
          <span class="text-pencil-gray font-bold">errores corregidos</span>
        </div>
        <div
          v-if="topMissedKey"
          class="inline-flex items-center gap-1.5 rounded-xl border-2 border-faded-gray px-3 py-1.5 animate-pop-in"
          :style="staggerStyle(3, { step: 70, base: 400 })"
        >
          <span class="text-pencil-gray font-bold">más fallada:</span>
          <kbd
            class="px-2 py-0.5 bg-danger-tint text-danger rounded-md font-mono font-extrabold border-2 border-danger/30"
            >{{ formatKeyLabel(topMissedKey.key) }}</kbd
          >
          <span class="text-pencil-gray font-bold">×{{ topMissedKey.misses }}</span>
        </div>
      </div>
    </Transition>

    <!-- Results chart: WPM over time, with error markers -->
    <Transition
      enter-active-class="transition-all duration-700 ease-smooth delay-100"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="isCompleted && configStore.wpmHistory.length >= 2"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray"
      >
        <WpmChart :history="configStore.wpmHistory" />
      </div>
    </Transition>

    <!-- Completion Message -->
    <Transition
      enter-active-class="transition-all duration-700 ease-smooth delay-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="isCompleted" class="text-center mb-6">
        <div
          class="inline-flex items-center gap-2 bg-success-tint rounded-xl px-5 py-2.5 text-sm text-success-dark font-bold"
        >
          Presiona
          <kbd
            class="px-2 py-0.5 bg-paper-white text-charcoal rounded-md font-mono text-xs border-2 border-faded-gray"
            >ESPACIO</kbd
          >
          para empezar de nuevo
        </div>
      </div>
    </Transition>

    <div v-if="!isCompleted" class="relative animate-fade-in">
      <!-- Header row: WPM (left) + streak/counter (right). Always in normal
           flow, above the scrolling text, so it can never end up overlapping
           it once the paragraph scrolls. -->
      <div class="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        <div class="min-h-[1.75rem] sm:min-h-[2.25rem]">
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="configStore.userInput.length > 0 && !isCompleted"
              class="flex items-baseline gap-1.5"
            >
              <span
                class="font-display text-2xl sm:text-3xl font-extrabold tabular-nums transition-colors duration-200"
                :class="configStore.isBeatingBest ? 'text-success' : 'text-charcoal'"
                >{{ configStore.wpm }}</span
              >
              <span class="text-xs text-pencil-gray font-bold uppercase">wpm</span>
            </div>
            <!-- Before typing starts, show which language this snippet is -->
            <div
              v-else-if="configStore.type === 'code' && currentCodeLanguage"
              class="inline-flex items-center rounded-lg bg-primary-tint px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-primary"
            >
              {{ currentCodeLanguage }}
            </div>
          </Transition>
        </div>

        <div v-if="configStore.userInput.length > 0" class="flex items-center gap-2">
          <!-- New record badge: a bit more "solid"/celebratory than the
               streak badge below, since breaking your best is the bigger
               deal — same success-green family, just filled instead of
               tinted, so the whole "beating best" language (this badge,
               the wpm number, the progress bar) stays visually consistent. -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75"
          >
            <div
              v-if="configStore.isBeatingBest"
              class="inline-flex items-center gap-1 bg-success border-2 border-success-dark rounded-xl px-2.5 py-1.5 shadow-sm shadow-success/40 animate-key-pop"
            >
              <TrophyIcon class="w-3.5 h-3.5 text-white animate-badge-glow" />
              <span class="text-xs font-extrabold text-white">Récord</span>
            </div>
          </Transition>

          <!-- Streak badge -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75"
          >
            <div
              v-if="configStore.currentStreak >= 15"
              :key="Math.floor(configStore.currentStreak / 10)"
              :style="streakBadgeStyle"
              class="inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 animate-key-pop"
            >
              <FireIcon class="w-3.5 h-3.5 animate-badge-glow" />
              <span class="text-xs font-extrabold">{{ configStore.currentStreak }}</span>
            </div>
          </Transition>

          <div
            class="inline-flex items-center gap-2 sm:gap-3 bg-paper-white rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 border-2 border-faded-gray min-w-0"
          >
            <!-- Time Counter -->
            <div v-if="configStore.type === 'time'" class="flex items-center gap-2">
              <ClockIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div class="flex items-baseline gap-1">
                <span class="text-base sm:text-lg font-extrabold text-charcoal"
                  >{{ configStore.timeElapsed }}s</span
                >
                <span class="text-xs sm:text-sm text-pencil-gray"
                  >/ {{ configStore.selectedTime }}s</span
                >
              </div>
            </div>

            <!-- Words Counter -->
            <div
              v-if="configStore.type === 'words' || configStore.type === 'numbers'"
              class="flex items-center gap-2"
            >
              <HashtagIcon
                v-if="configStore.type === 'numbers'"
                class="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0"
              />
              <DocumentTextIcon
                v-else
                class="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0"
              />
              <div class="flex items-baseline gap-1">
                <span class="text-base sm:text-lg font-extrabold text-charcoal">{{
                  configStore.typedWords
                }}</span>
                <span class="text-xs sm:text-sm text-pencil-gray"
                  >/ {{ configStore.selectedWords }}</span
                >
              </div>
            </div>

            <!-- Zen Counter: no limit, just elapsed time -->
            <div v-if="configStore.type === 'zen'" class="flex items-center gap-2">
              <ClockIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <span class="text-base sm:text-lg font-extrabold text-charcoal"
                >{{ configStore.timeElapsed }}s</span
              >
            </div>

            <!-- Characters Counter (default) -->
            <div
              v-if="
                configStore.type !== 'time' &&
                configStore.type !== 'words' &&
                configStore.type !== 'numbers' &&
                configStore.type !== 'zen'
              "
              class="flex items-center gap-2"
            >
              <HashtagIcon class="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div class="flex items-baseline gap-1">
                <span class="text-base sm:text-lg font-extrabold text-charcoal">{{
                  configStore.userInput.length
                }}</span>
                <span class="text-xs sm:text-sm text-pencil-gray"
                  >/ {{ referenceText.length }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- A textarea (not a single-line input) so "code" mode can capture
           real Enter/newline keystrokes. -->
      <textarea
        ref="typingInput"
        v-model="configStore.userInput"
        class="absolute inset-0 w-full h-full resize-none opacity-0 cursor-default"
        :disabled="isCompleted"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        @input="handleTyping"
        @keydown="handleKeydown"
      ></textarea>

      <!-- Pause Overlay: frosted fade over the text, card springs in -->
      <Transition
        enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-smooth"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-[opacity,backdrop-filter] duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="configStore.isPaused"
          class="absolute inset-0 bg-paper-white/80 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none"
        >
          <div class="text-center animate-pop-in">
            <PauseIcon class="w-10 h-10 mx-auto text-primary mb-3" />
            <div class="text-lg font-display font-extrabold text-charcoal mb-1">
              Pausado
            </div>
            <div class="text-sm text-pencil-gray">Escribe para continuar</div>
            <div class="hidden sm:block mt-2 text-xs text-pencil-gray">
              <kbd
                class="px-1.5 py-0.5 bg-paper-white text-charcoal rounded-md font-mono border-2 border-faded-gray"
                >ESC</kbd
              >
              para terminar la partida
            </div>
          </div>
        </div>
      </Transition>

      <div
        ref="typingContainer"
        class="px-2 py-6 sm:py-8 text-charcoal text-lg sm:text-xl leading-relaxed font-mono select-none relative typing-container overflow-hidden h-[210px] xs:h-[230px] sm:h-[340px] [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
        @click="focusInput"
      >
        <div
          class="absolute -top-3 left-0 h-1 transition-[width,background-color] duration-300 ease-out rounded-full"
          :class="configStore.isBeatingBest ? 'bg-success' : 'bg-primary'"
          :style="{ width: `${configStore.progressPercentage}%` }"
        ></div>

        <div class="relative text-left max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-0">
          <div
            ref="textContentEl"
            :key="`text-${textVersion}`"
            class="animate-fade-in relative font-mono text-2xl sm:text-3xl leading-[1.9] tracking-wide whitespace-pre-wrap"
          >
            <!-- Smooth animated caret -->
            <div
              v-show="!isCompleted && !configStore.isPaused"
              class="absolute w-1 rounded-full bg-primary transition-[top,left,height] duration-100 ease-out pointer-events-none"
              :class="{ 'animate-caret-idle': configStore.userInput.length === 0 }"
              :style="{
                top: `${caretPosition.top}px`,
                left: `${caretPosition.left}px`,
                height: `${caretPosition.height}px`,
              }"
            ></div>

            <span v-for="(group, groupIndex) in wordGroups" :key="groupIndex">
              <span
                v-if="group.type === 'word'"
                class="inline-block break-words max-w-full"
              >
                <span
                  v-for="c in group.chars"
                  :key="c.index"
                  :data-char-index="c.index"
                  :class="getCharacterClass(c.index)"
                  >{{ c.char }}</span
                >
              </span>
              <span
                v-else
                :data-char-index="group.index"
                :class="getCharacterClass(group.index)"
                >{{ group.char }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-6 sm:mt-12 text-center flex gap-2 sm:gap-3 justify-center transition-[opacity,translate] duration-500 ease-smooth"
      :class="
        isTypingActive
          ? 'opacity-0 translate-y-3 pointer-events-none select-none duration-300'
          : 'opacity-100 translate-y-0'
      "
      :aria-hidden="isTypingActive"
    >
      <IconButton
        icon="restart"
        variant="secondary"
        size="lg"
        tooltip="Reiniciar"
        @click="restart"
      />

      <!-- Pausing only makes sense once there's an actual session going -->
      <template v-if="configStore.userInput.length > 0">
        <!-- Show pause button when not paused -->
        <IconButton
          v-if="!isCompleted && !configStore.isPaused"
          icon="pause"
          variant="primary"
          size="lg"
          tooltip="Pausar"
          @click="pause"
        />

        <!-- Show play button when paused -->
        <IconButton
          v-if="!isCompleted && configStore.isPaused"
          icon="play"
          variant="primary"
          size="lg"
          tooltip="Continuar"
          @click="play"
        />
      </template>

      <!-- Zen mode has no limit, so the only way to end it is manually -->
      <IconButton
        v-if="configStore.type === 'zen' && !isCompleted"
        icon="check"
        variant="primary"
        size="lg"
        tooltip="Terminar"
        @click="finishZen"
      />

      <IconButton
        v-if="isCompleted"
        icon="share"
        variant="primary"
        size="lg"
        tooltip="Compartir resultado"
        @click="handleShare"
      />
    </div>

    <ShareResultModal
      :open="shareModalOpen"
      :image-url="shareImageUrl"
      :can-native-share="canNativeShare"
      @close="closeShareModal"
      @download="confirmDownload"
      @share="confirmNativeShare"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import IconButton from "@/shared/components/IconButton.vue";
import AnimatedNumber from "@/shared/components/AnimatedNumber.vue";
import { staggerStyle } from "@/shared/utils/motion";
import WpmChart from "./WpmChart.vue";
import ShareResultModal from "./ShareResultModal.vue";
import {
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  PauseIcon,
  FireIcon,
  TrophyIcon,
  StopIcon,
} from "@heroicons/vue/24/outline";
import { paragraphs } from "@/features/typing-test/content/paragraphs";
import { generateRandomWords } from "@/features/typing-test/content/words";
import { generateRandomNumbers } from "@/features/typing-test/content/numbers";
import { getRandomQuote } from "@/features/typing-test/content/quotes";
import { getRandomCodeSnippet } from "@/features/typing-test/content/code";
import { useConfigStore } from "@/features/typing-test/store";
import { groupIntoWords } from "@/features/typing-test/utils/textGroups";
import { getCharacterStreakColorRgb } from "@/shared/utils/flameColor";
import { computeKeyboardViewportStyle } from "@/features/typing-test/utils/keyboardViewport";
import { useHistoryStore } from "@/features/history/store";
import {
  formatModeLabel,
  formatKeyLabel,
  computeKeyErrorStats,
} from "@/features/history/utils/historyStats";
import { drawShareCard } from "@/features/typing-test/utils/shareCard";
import { useSoundStore } from "@/shared/stores/sound";
import {
  playKeystrokeSound,
  playErrorSound,
  playCelebrationSound,
} from "@/shared/utils/sound";

// Config store
const configStore = useConfigStore();
const historyStore = useHistoryStore();
const soundStore = useSoundStore();

// Local component state
const lastParagraph = ref(null);
const lastQuoteText = ref(null);
const currentQuoteAuthor = ref("");
const lastCodeText = ref(null);
const currentCodeLanguage = ref("");
const typingInput = ref(null);
const typingContainer = ref(null);
const textContentEl = ref(null);

// Snapshot of "did this session beat the best" taken right when it
// completes — configStore.isBeatingBest itself goes false immediately
// after updateBestWpm() runs (bestWpm becomes equal to wpm, no longer
// strictly greater), so the results screen/share card need this frozen
// copy instead of reading the live computed.
const justBrokeRecord = ref(false);

// On mobile, `top-1/2` (and the "vh"-based max-height) is computed against
// the full layout viewport, which most mobile browsers DON'T shrink when
// the on-screen keyboard opens — so this card stays centered against a
// height that no longer matches what's actually visible, and the current
// line ends up hidden behind the keyboard. computeKeyboardViewportStyle
// uses the Visual Viewport API's real visible area to recenter against
// that instead while the keyboard is open (falls back to the plain CSS
// centering otherwise/on browsers without it, e.g. desktop).
const viewportStyle = ref({});

const updateViewportStyle = () => {
  const vv = window.visualViewport;
  if (!vv) return;

  const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;

  viewportStyle.value = computeKeyboardViewportStyle({
    innerHeight: window.innerHeight,
    visualViewport: { offsetTop: vv.offsetTop, height: vv.height },
    topInset: navHeight,
  });
};

// Esc pauses a running session; Esc again while paused ends it.
const handleEscapeKeydown = (event) => {
  if (event.key !== "Escape") return;
  if (isCompleted.value || configStore.userInput.length === 0) return;

  event.preventDefault();
  if (configStore.isPaused) {
    configStore.endSession();
  } else {
    configStore.pause();
  }
};

// Global keydown listener for space key when completed
const handleGlobalKeydown = (event) => {
  if (event.key === " " && isCompleted.value) {
    event.preventDefault();
    restart();
  }
};

// Use the formatted reference text from the store
const referenceText = computed(() => {
  return configStore.referenceText;
});

// Picks a random paragraph, avoiding immediately repeating the last one.
const pickRandomParagraph = () => {
  if (paragraphs.length === 1) return paragraphs[0];

  let text;
  do {
    text = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  } while (text === lastParagraph.value);

  lastParagraph.value = text;
  return text;
};

// Loads a new, random reference text appropriate for the current mode: a
// freshly generated random-words text for "words", a random quote (with
// its author) for "quote", a random code snippet (with its language) for
// "code", or a random curated paragraph for "time"/"zen" (both keep
// extending it forever — see handleTyping). Called on mount, on restart,
// and whenever the mode/time/word-count selection changes — everything is
// always random.
// Bumped every time a brand-new text is loaded (not when time/zen mode
// appends more), keying the text block so it fades in fresh.
const textVersion = ref(0);

const refreshReferenceText = () => {
  textVersion.value++;
  if (configStore.type === "words") {
    configStore.setReferenceText(generateRandomWords(configStore.selectedWords));
    return;
  }

  if (configStore.type === "numbers") {
    configStore.setReferenceText(generateRandomNumbers(configStore.selectedWords));
    return;
  }

  if (configStore.type === "quote") {
    const quote = getRandomQuote(lastQuoteText.value);
    lastQuoteText.value = quote.text;
    currentQuoteAuthor.value = quote.author;
    configStore.setReferenceText(quote.text);
    return;
  }

  if (configStore.type === "code") {
    const snippet = getRandomCodeSnippet(
      lastCodeText.value,
      configStore.selectedCodeLanguage
    );
    lastCodeText.value = snippet.code;
    currentCodeLanguage.value = snippet.language;
    configStore.setReferenceText(snippet.code);
    return;
  }

  configStore.setReferenceText(pickRandomParagraph());
};

// Initialize the reference text as soon as the component is set up
refreshReferenceText();

// Delegate to the store's isCompleted so there's a single source of truth
// (HomeView also reads configStore.isCompleted directly to know when to
// show the toolbar again).
const isCompleted = computed(() => configStore.isCompleted);

// The streak badge's color escalates like a flame (amber -> orange -> red)
// as the streak grows, instead of staying a flat color — computed as
// inline styles since Tailwind's utility classes can't interpolate at
// runtime. Text/icon pick up the color via `currentColor` (unset).
const streakBadgeStyle = computed(() => {
  const [r, g, b] = getCharacterStreakColorRgb(configStore.currentStreak);
  return {
    color: `rgb(${r} ${g} ${b})`,
    borderColor: `rgb(${r} ${g} ${b})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    boxShadow: `0 1px 3px 0 rgba(${r}, ${g}, ${b}, 0.35)`,
  };
});

// Per-keystroke results: how many mistakes got fixed, and the key missed
// most this session.

const correctedErrors = computed(() =>
  Math.max(0, configStore.errorKeystrokes - configStore.errors)
);

// The four main result cards. Timed sessions show whole seconds; anything
// that ends on its own (a quote, a word count) shows one decimal.
const resultCards = computed(() => {
  const timed = configStore.type === "time" && !configStore.endedEarly;
  return [
    { label: "WPM", value: configStore.wpm, decimals: 0, suffix: "" },
    { label: "Precisión", value: configStore.accuracy, decimals: 0, suffix: "%" },
    {
      label: "Tiempo",
      value: timed ? configStore.timeElapsed : configStore.elapsedMs / 1000,
      decimals: timed ? 0 : 1,
      suffix: "s",
    },
    { label: "Errores", value: configStore.errors, decimals: 0, suffix: "" },
  ];
});

const topMissedKey = computed(() => {
  const [top] = computeKeyErrorStats([
    { keyAttempts: configStore.keyAttempts, missedKeys: configStore.missedKeys },
  ]);
  return top?.misses > 0 ? top : null;
});

// Whether the user is actively typing right now (controls hides while typing,
// e.g. the nav/pause buttons) — mirrors the same idea used in HomeView.
const isTypingActive = computed(() => {
  return configStore.userInput.length > 0 && !isCompleted.value && !configStore.isPaused;
});

// The extra bit of context shown next to each history entry: the target
// for modes that have one, or the actual code language typed (not just the
// filter, since "Todos" resolves to a specific snippet's language).
const currentModeValue = () => {
  if (configStore.type === "time") return configStore.selectedTime;
  if (configStore.type === "words" || configStore.type === "numbers") {
    return configStore.selectedWords;
  }
  if (configStore.type === "code") return currentCodeLanguage.value;
  return null;
};

// Watch for completion
watch(isCompleted, (completed) => {
  if (completed) {
    // Stop the timer and clear inactivity timer when completed
    if (configStore.timer) {
      clearInterval(configStore.timer);
      configStore.timer = null;
    }
    configStore.clearInactivityTimer();
    // One last sample so the results chart's final point matches the
    // final stats exactly, even if completion landed between ticks
    configStore.recordWpmSample();

    // A session cut short with Esc still shows its results, but it isn't a
    // real attempt at the mode, so it doesn't touch records or history.
    if (configStore.endedEarly) {
      justBrokeRecord.value = false;
    } else {
      justBrokeRecord.value = configStore.isBeatingBest;
      if (
        justBrokeRecord.value &&
        soundStore.soundEnabled &&
        soundStore.celebrationSound
      ) {
        playCelebrationSound();
      }
      configStore.updateBestWpm();
      historyStore.recordResult({
        mode: configStore.type,
        wpm: configStore.wpm,
        accuracy: configStore.accuracy,
        errors: configStore.errors,
        rawWpm: configStore.rawWpm,
        timeElapsed: configStore.timeElapsed,
        modeValue: currentModeValue(),
        maxStreak: configStore.maxStreak,
        keystrokes: configStore.keystrokes,
        errorKeystrokes: configStore.errorKeystrokes,
        keyAttempts: { ...configStore.keyAttempts },
        missedKeys: { ...configStore.missedKeys },
      });
    }

    // Add global keydown listener for space key restart
    document.addEventListener("keydown", handleGlobalKeydown);
  } else {
    // Remove global keydown listener when not completed
    document.removeEventListener("keydown", handleGlobalKeydown);
  }
});

// Show all text from the beginning
const visibleText = computed(() => {
  return referenceText.value;
});

// Group characters into words so the browser wraps at word boundaries
// (individual per-character spans keep the exact index-based coloring/logic)
const wordGroups = computed(() => groupIntoWords(visibleText.value));

// Smooth animated caret position, tracked relative to the typing container
const caretPosition = ref({ top: 0, left: 0, height: 0 });

const getCurrentCharElement = () => {
  if (!typingContainer.value) return null;
  return typingContainer.value.querySelector(
    `[data-char-index="${configStore.userInput.length}"]`
  );
};

const updateCaretPosition = () => {
  const target = getCurrentCharElement();
  if (!target || !textContentEl.value) return;

  // Caret is absolutely positioned inside textContentEl, so its coordinates
  // must be measured relative to that element (its actual positioned
  // ancestor), not the outer scroll container.
  const containerRect = textContentEl.value.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  caretPosition.value = {
    top: targetRect.top - containerRect.top,
    left: targetRect.left - containerRect.left,
    height: targetRect.height,
  };
};

// Keep the caret synced with the reference text and current typing progress
watch(referenceText, () => {
  nextTick(updateCaretPosition);
});

// Keystroke feedback sound: only for an actual new character typed (not a
// backspace, and not the reset back to "" between sessions/reference-text
// changes — both shrink or match length instead of growing it).
watch(
  () => configStore.userInput,
  (newValue, oldValue) => {
    if (!soundStore.soundEnabled) return;
    if (newValue.length <= oldValue.length) return;

    const lastIndex = newValue.length - 1;
    const isCorrect = newValue[lastIndex] === referenceText.value[lastIndex];

    if (isCorrect) {
      if (soundStore.keystrokeSound) playKeystrokeSound();
    } else if (soundStore.errorSound) {
      playErrorSound();
    }
  }
);

// Watch for config changes: reload the reference text (a fresh random
// words text if the word count changed, or the same paragraph reloaded
// otherwise) whenever the mode/time/word-count/code-language selection
// changes.
watch(
  () => [
    configStore.type,
    configStore.selectedTime,
    configStore.selectedWords,
    configStore.selectedCodeLanguage,
  ],
  () => {
    refreshReferenceText();
    nextTick(updateCaretPosition);
  },
  { deep: true }
);

// Clicking a toolbar option leaves the focus on that button, so typing
// wouldn't reach the hidden textarea until clicking the text. Hand focus
// back after any config change — only with a mouse/trackpad, since on touch
// screens focusing would pop the on-screen keyboard mid-configuration.
watch(
  () => [
    configStore.type,
    configStore.selectedTime,
    configStore.selectedWords,
    configStore.selectedCodeLanguage,
    configStore.selectedContentTypes,
  ],
  () => {
    if (window.matchMedia?.("(pointer: fine)").matches) {
      nextTick(focusInput);
    }
  }
);

// Fallback for whenever focus ends up anywhere else (clicked the page
// background, re-clicked an already-selected option...): the first
// printable key moves focus to the textarea. Moving focus during keydown
// makes the browser deliver that same keystroke to the textarea, so the
// character isn't lost (and a focused button doesn't get "clicked" by space).
const handleTypeAnywhereKeydown = (event) => {
  if (isCompleted.value || shareModalOpen.value) return;
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

  const active = document.activeElement;
  if (active === typingInput.value) return;
  if (active?.closest?.("input, textarea, select, [contenteditable='true']")) return;

  focusInput();
};

const focusInput = () => {
  typingInput.value?.focus();
};

// Keeps the line being typed vertically centered in the box at all times
// (not just once it's about to scroll out of view) — so with, say, 5 lines
// visible, the current one always sits in the middle: 2 lines of context
// above, 2 of what's coming up below. Calling this every keystroke is
// cheap: scrollIntoView is a no-op once the target is already centered, so
// it only actually animates right when a new line starts.
const scrollToCurrentPosition = () => {
  if (!typingContainer.value || configStore.userInput.length === 0) return;

  const currentChar = getCurrentCharElement();
  if (!currentChar) return;

  currentChar.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
};

// How close (in characters) to the end of the text before we tack on
// another random paragraph, so there's always a buffer of text ahead.
const EXTEND_TEXT_THRESHOLD = 80;

const handleTyping = () => {
  // Don't handle typing if session is already completed
  if (isCompleted.value) {
    return;
  }

  configStore.handleTyping();

  // In "time" and "zen" modes there's no fixed end — top up the text with
  // another random paragraph once we're nearing the end of the current one.
  if (configStore.type === "time" || configStore.type === "zen") {
    const remaining = referenceText.value.length - configStore.userInput.length;
    if (remaining < EXTEND_TEXT_THRESHOLD) {
      configStore.extendReferenceText(pickRandomParagraph());
    }
  }

  // Auto-scroll to keep current position visible and glide the caret
  scrollToCurrentPosition();
  nextTick(updateCaretPosition);
};

const handleKeydown = (event) => {
  // Handle space key when session is completed to restart
  if (event.key === " " && isCompleted.value) {
    event.preventDefault();
    restart();
    return;
  }

  if (event.key === "Backspace" && configStore.userInput.length === 0) {
    event.preventDefault();
  }
};

const getCharacterClass = (index) => {
  const baseClasses = "transition-colors duration-150 select-none";
  const isJustTyped = index === configStore.userInput.length - 1;

  if (index < configStore.userInput.length) {
    if (configStore.userInput[index] === visibleText.value[index]) {
      return `${baseClasses} text-success font-bold${isJustTyped ? " animate-key-pop" : ""}`;
    } else {
      return `${baseClasses} text-danger bg-danger-tint rounded-sm${isJustTyped ? " animate-key-shake" : ""}`;
    }
  } else {
    return `${baseClasses} text-pencil-gray`;
  }
};

const restart = () => {
  justBrokeRecord.value = false;
  refreshReferenceText();
  nextTick(updateCaretPosition);
  setTimeout(() => {
    typingInput.value?.focus();
  }, 100);
};

const pause = () => {
  configStore.pause();
};

const play = () => {
  configStore.play();
  setTimeout(() => {
    typingInput.value?.focus();
  }, 100);
};

const finishZen = () => {
  configStore.finishZen();
};

// Share modal state: renders the result to a PNG once (on click) and shows
// it in a preview before the user confirms sharing/downloading it, rather
// than firing off the OS share sheet or a silent download immediately.
const shareModalOpen = ref(false);
const shareImageUrl = ref(null);
const shareBlob = ref(null);
const canNativeShare = ref(false);

const shareFileName = "swiftflow-resultado.png";

const shareText = () =>
  justBrokeRecord.value
    ? `¡Nuevo récord! ${configStore.wpm} WPM en SwiftFlow 🏆`
    : `${configStore.wpm} WPM en SwiftFlow ⚡`;

const handleShare = () => {
  const canvas = document.createElement("canvas");
  drawShareCard(canvas, {
    wpm: configStore.wpm,
    accuracy: configStore.accuracy,
    errors: configStore.errors,
    modeLabel: formatModeLabel({ mode: configStore.type, modeValue: currentModeValue() }),
    streak: historyStore.dailyStreak,
    isRecord: justBrokeRecord.value,
  });

  canvas.toBlob((blob) => {
    if (!blob) return;

    shareBlob.value = blob;
    shareImageUrl.value = URL.createObjectURL(blob);
    const file = new File([blob], shareFileName, { type: "image/png" });
    canNativeShare.value = Boolean(navigator.canShare?.({ files: [file] }));
    shareModalOpen.value = true;
  }, "image/png");
};

const closeShareModal = () => {
  shareModalOpen.value = false;
  if (shareImageUrl.value) {
    URL.revokeObjectURL(shareImageUrl.value);
  }
  shareImageUrl.value = null;
  shareBlob.value = null;
};

const confirmDownload = () => {
  if (!shareImageUrl.value) return;
  const link = document.createElement("a");
  link.href = shareImageUrl.value;
  link.download = shareFileName;
  link.click();
  closeShareModal();
};

const confirmNativeShare = async () => {
  if (!shareBlob.value) return;
  const file = new File([shareBlob.value], shareFileName, { type: "image/png" });

  try {
    await navigator.share({
      files: [file],
      title: "Mi resultado en SwiftFlow",
      text: shareText(),
    });
    closeShareModal();
  } catch {
    // User closed the native share sheet — leave the preview open so they
    // can still download it instead.
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscapeKeydown);
  document.addEventListener("keydown", handleTypeAnywhereKeydown);
  typingInput.value?.focus();
  nextTick(updateCaretPosition);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateViewportStyle);
    window.visualViewport.addEventListener("scroll", updateViewportStyle);
  }
});

onUnmounted(() => {
  // Clear any timers from the config store
  if (configStore.timer) {
    clearInterval(configStore.timer);
    configStore.timer = null;
  }
  configStore.clearInactivityTimer();

  // Remove global keydown listeners
  document.removeEventListener("keydown", handleGlobalKeydown);
  document.removeEventListener("keydown", handleEscapeKeydown);
  document.removeEventListener("keydown", handleTypeAnywhereKeydown);

  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", updateViewportStyle);
    window.visualViewport.removeEventListener("scroll", updateViewportStyle);
  }

  if (shareImageUrl.value) {
    URL.revokeObjectURL(shareImageUrl.value);
  }
});
</script>

<style scoped>
@keyframes key-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.16);
  }
  100% {
    transform: scale(1);
  }
}

.animate-key-pop {
  animation: key-pop 180ms ease-out;
}

@keyframes key-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(-1.5px);
  }
  70% {
    transform: translateX(1.5px);
  }
}

.animate-key-shake {
  animation: key-shake 160ms ease-out;
}

/* Gentle continuous pulse for the record/streak badge icons — subtle on
   purpose, just enough to feel "alive" without distracting from typing. */
@keyframes badge-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

.animate-badge-glow {
  animation: badge-glow 1.6s ease-in-out infinite;
}
</style>
