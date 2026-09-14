<template>
  <div class="relative space-y-6">
    <div
      v-if="isCompleted"
      class="grid gap-4 sm:gap-6 text-center grid-cols-2 sm:grid-cols-4"
    >
      <!-- WPM Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray animate-celebrate"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            {{ configStore.wpm }}
          </div>
          <div class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide">WPM</div>
        </div>
      </Transition>

      <!-- Accuracy Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-75"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray animate-celebrate"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            {{ configStore.accuracy }}%
          </div>
          <div class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide">
            Precisión
          </div>
        </div>
      </Transition>

      <!-- Time Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-100"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray animate-celebrate"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            {{ configStore.timeElapsed }}s
          </div>
          <div class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide">Tiempo</div>
        </div>
      </Transition>

      <!-- Errors Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-150"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray animate-celebrate"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            {{ configStore.errors }}
          </div>
          <div class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide">
            Errores
          </div>
        </div>
      </Transition>
    </div>

    <!-- Completion Message -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out delay-200"
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

    <div class="relative">
      <!-- Live WPM positioned outside the scrolling container -->
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
          class="absolute top-2 left-2 xs:top-3 xs:left-3 sm:top-3 sm:left-3 z-20"
        >
          <div class="flex items-baseline gap-1.5">
            <span
              class="font-display text-2xl sm:text-3xl font-extrabold tabular-nums transition-colors duration-200"
              :class="configStore.isBeatingBest ? 'text-success' : 'text-charcoal'"
              >{{ configStore.wpm }}</span
            >
            <span class="text-xs text-pencil-gray font-bold uppercase">wpm</span>
          </div>
        </div>
      </Transition>

      <!-- Counter positioned outside the scrolling container -->
      <div
        class="absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-3 sm:right-3 z-20 flex items-center gap-2"
      >
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
            class="inline-flex items-center gap-1 bg-success-tint border-2 border-success rounded-xl px-2.5 py-1.5 animate-key-pop"
            :key="Math.floor(configStore.currentStreak / 10)"
          >
            <FireIcon class="w-3.5 h-3.5 text-success-dark" />
            <span class="text-xs font-extrabold text-success-dark"
              >{{ configStore.currentStreak }}</span
            >
          </div>
        </Transition>

        <div
          class="inline-flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 bg-paper-white rounded-xl px-3 py-1.5 border-2 border-faded-gray min-w-0"
        >
          <!-- Time Counter -->
          <div
            v-if="configStore.type === 'time'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <ClockIcon class="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary flex-shrink-0" />
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span class="text-xs xs:text-sm font-extrabold text-charcoal"
                >{{ configStore.timeElapsed }}s</span
              >
              <span class="text-xs text-pencil-gray"
                >/ {{ configStore.selectedTime }}s</span
              >
            </div>
          </div>

          <!-- Words Counter -->
          <div
            v-if="configStore.type === 'words'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <DocumentTextIcon class="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary flex-shrink-0" />
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span class="text-xs xs:text-sm font-extrabold text-charcoal"
                >{{ configStore.typedWords }}</span
              >
              <span class="text-xs text-pencil-gray"
                >/ {{ configStore.selectedWords }}</span
              >
            </div>
          </div>

          <!-- Characters Counter (default) -->
          <div
            v-if="configStore.type !== 'time' && configStore.type !== 'words'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <HashtagIcon class="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary flex-shrink-0" />
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span class="text-xs xs:text-sm font-extrabold text-charcoal"
                >{{ configStore.userInput.length }}</span
              >
              <span class="text-xs text-pencil-gray"
                >/ {{ referenceText.length }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <input
        ref="typingInput"
        v-model="configStore.userInput"
        @input="handleTyping"
        @keydown="handleKeydown"
        class="absolute inset-0 w-full h-full opacity-0 cursor-default"
        :disabled="isCompleted"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />

      <!-- Pause Overlay -->
      <div
        v-if="configStore.isPaused"
        class="absolute inset-0 bg-paper-white/90 flex items-center justify-center rounded-card z-10 pointer-events-none"
      >
        <div class="text-center">
          <PauseIcon class="w-10 h-10 mx-auto text-primary mb-3" />
          <div class="text-lg font-display font-extrabold text-charcoal mb-1">
            Pausado
          </div>
          <div class="text-sm text-pencil-gray">Escribe para continuar</div>
        </div>
      </div>

      <div
        ref="typingContainer"
        class="bg-paper-white rounded-card px-6 py-10 sm:p-10 border-2 border-faded-gray text-charcoal text-lg sm:text-xl leading-relaxed font-mono select-none relative typing-container h-[200px] sm:h-[300px]"
        :class="{
          'overflow-y-auto': !configStore.isPaused,
          'overflow-hidden': configStore.isPaused,
        }"
        @click="focusInput"
      >
        <div
          class="absolute top-0 left-0 h-1.5 transition-[width,background-color] duration-300 ease-out rounded-full"
          :class="configStore.isBeatingBest ? 'bg-success' : 'bg-primary'"
          :style="{ width: `${configStore.progressPercentage}%` }"
        ></div>

        <div
          class="relative text-left max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-0"
        >
          <div
            ref="textContentEl"
            key="text-content"
            class="relative font-mono text-xl sm:text-2xl leading-[1.9] tracking-wide"
          >
            <!-- Smooth animated caret -->
            <div
              v-show="!isCompleted && !configStore.isPaused"
              class="absolute w-1 rounded-full bg-primary transition-all duration-100 ease-out pointer-events-none"
              :style="{
                top: `${caretPosition.top}px`,
                left: `${caretPosition.left}px`,
                height: `${caretPosition.height}px`,
              }"
            ></div>

            <span v-for="(group, groupIndex) in wordGroups" :key="groupIndex">
              <span v-if="group.type === 'word'" class="inline-block">
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
                >{{ " " }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 sm:mt-12 text-center flex gap-3 justify-center">
      <IconButton
        icon="back"
        variant="secondary"
        size="lg"
        tooltip="Anterior"
        @click="previous"
      />
      <IconButton
        icon="restart"
        variant="secondary"
        size="lg"
        tooltip="Reiniciar"
        @click="restart"
      />

      <!-- Show pause button when not paused -->
      <IconButton
        v-if="!configStore.isPaused"
        icon="pause"
        variant="primary"
        size="lg"
        tooltip="Pausar"
        @click="pause"
      />

      <!-- Show play button when paused -->
      <IconButton
        v-if="configStore.isPaused"
        icon="play"
        variant="primary"
        size="lg"
        tooltip="Continuar"
        @click="play"
      />

      <IconButton
        icon="next"
        variant="secondary"
        size="lg"
        tooltip="Siguiente"
        @click="next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import IconButton from "@/components/common/IconButton.vue";
import { ClockIcon, DocumentTextIcon, HashtagIcon, PauseIcon, FireIcon } from "@heroicons/vue/24/outline";
import { paragraphs } from "@/constants/paragraphs";
import { useConfigStore } from "@/stores/config";

// Config store
const configStore = useConfigStore();

// Local component state
const currentTextIndex = ref(0);
const typingInput = ref(null);
const typingContainer = ref(null);
const textContentEl = ref(null);

// Global keydown listener for space key when completed
const handleGlobalKeydown = (event) => {
  if (event.key === " " && isCompleted.value) {
    event.preventDefault();
    restart();
  }
};

// Current reference text from the collection (raw text)
const rawReferenceText = computed(() => {
  return paragraphs[currentTextIndex.value];
});

// Use the formatted reference text from the store
const referenceText = computed(() => {
  return configStore.referenceText;
});

// Set the reference text in the store when it changes
watch(
  rawReferenceText,
  (newText) => {
    configStore.setReferenceText(newText);
  },
  { immediate: true }
);

// Local isCompleted that uses the component's referenceText
const isCompleted = computed(() => {
  if (!referenceText.value) return false;

  // Always complete if the entire text is finished, regardless of time/word limits
  if (configStore.userInput.length >= referenceText.value.length) {
    return true;
  }

  // Time-based completion
  if (configStore.type === "time") {
    return configStore.timeElapsed >= configStore.selectedTime;
  }

  // Words-based completion
  if (configStore.type === "words") {
    return configStore.typedWords >= configStore.selectedWords;
  }

  // Default: complete when all text is typed
  return configStore.userInput.length >= referenceText.value.length;
});

// Watch for completion
watch(isCompleted, (completed) => {
  if (completed) {
    // Stop the timer and clear inactivity timer when completed
    if (configStore.timer) {
      clearInterval(configStore.timer);
      configStore.timer = null;
    }
    configStore.clearInactivityTimer();
    configStore.updateBestWpm();

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
const wordGroups = computed(() => {
  const text = visibleText.value;
  const groups = [];
  let currentWord = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      if (currentWord.length) {
        groups.push({ type: "word", chars: currentWord });
        currentWord = [];
      }
      groups.push({ type: "space", index: i });
    } else {
      currentWord.push({ char: ch, index: i });
    }
  }

  if (currentWord.length) {
    groups.push({ type: "word", chars: currentWord });
  }

  return groups;
});

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

// Watch for config changes and reset session
watch(
  () => [configStore.type, configStore.selectedTime, configStore.selectedWords],
  () => {
    // Reset the typing session when config changes
    restart();
  },
  { deep: true }
);

const focusInput = () => {
  typingInput.value?.focus();
};

const scrollToCurrentPosition = () => {
  if (!typingContainer.value || configStore.userInput.length === 0) return;

  const currentChar = getCurrentCharElement();
  if (!currentChar) return;

  const container = typingContainer.value;

  // Calculate the position of the current character relative to the container
  const charRect = currentChar.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Check if the character is outside the visible area
  const isAboveView = charRect.top < containerRect.top;
  const isBelowView = charRect.bottom > containerRect.bottom;

  if (isAboveView || isBelowView) {
    // Scroll to make the current character visible
    currentChar.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
};

const handleTyping = () => {
  // Don't handle typing if session is already completed
  if (isCompleted.value) {
    return;
  }

  configStore.handleTyping();

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
      return `${baseClasses} text-red-600 bg-red-100 rounded-sm${isJustTyped ? " animate-key-shake" : ""}`;
    }
  } else {
    return `${baseClasses} text-pencil-gray`;
  }
};

const restart = () => {
  configStore.resetTypingSession();
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

const next = () => {
  // Move to next text in collection
  currentTextIndex.value = (currentTextIndex.value + 1) % paragraphs.length;

  // Reset everything for new text
  configStore.resetTypingSession();
  nextTick(updateCaretPosition);

  // Add a small delay to allow the transition to complete
  setTimeout(() => {
    typingInput.value?.focus();
  }, 200);
};

const previous = () => {
  // Move to previous text in collection
  currentTextIndex.value =
    currentTextIndex.value === 0
      ? paragraphs.length - 1
      : currentTextIndex.value - 1;

  // Reset everything for new text
  configStore.resetTypingSession();
  nextTick(updateCaretPosition);

  // Add a small delay to allow the transition to complete
  setTimeout(() => {
    typingInput.value?.focus();
  }, 200);
};

onMounted(() => {
  typingInput.value?.focus();
  nextTick(updateCaretPosition);
});

onUnmounted(() => {
  // Clear any timers from the config store
  if (configStore.timer) {
    clearInterval(configStore.timer);
    configStore.timer = null;
  }
  configStore.clearInactivityTimer();

  // Remove global keydown listener
  document.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style scoped>
.typing-container:hover {
  border-color: var(--color-faded-gray);
}

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

@keyframes celebrate {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.animate-celebrate {
  animation: celebrate 700ms ease-out;
}
</style>
