<template>
  <div class="relative space-y-6">
    <div
      v-if="isCompleted"
      :class="[
        'grid gap-4 sm:gap-6 text-center ',
        isCompleted
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-4',
      ]"
    >
      <!-- WPM Card -->
      <Transition
        enter-active-class="transition-all duration-600 ease-out"
        enter-from-class="opacity-0 scale-75 translate-y-8 rotate-3"
        enter-to-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-to-class="opacity-0 scale-75 translate-y-8 rotate-3"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-emerald-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-emerald-300 mb-1">
            {{ configStore.wpm }}
          </div>
          <div class="text-xs sm:text-sm text-emerald-200/80 font-medium">
            WPM
          </div>
        </div>
      </Transition>

      <!-- Accuracy Card -->
      <Transition
        enter-active-class="transition-all duration-600 ease-out delay-150"
        enter-from-class="opacity-0 scale-75 translate-y-8 -rotate-3"
        enter-to-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-to-class="opacity-0 scale-75 translate-y-8 -rotate-3"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-blue-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-blue-300 mb-1">
            {{ configStore.accuracy }}%
          </div>
          <div class="text-xs sm:text-sm text-blue-200/80 font-medium">
            Precisión
          </div>
        </div>
      </Transition>

      <!-- Time Card -->
      <Transition
        enter-active-class="transition-all duration-600 ease-out delay-200"
        enter-from-class="opacity-0 scale-75 translate-y-8 rotate-2"
        enter-to-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-to-class="opacity-0 scale-75 translate-y-8 rotate-2"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-purple-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-purple-300 mb-1">
            {{ configStore.timeElapsed }}s
          </div>
          <div class="text-xs sm:text-sm text-purple-200/80 font-medium">
            Tiempo
          </div>
        </div>
      </Transition>

      <!-- Errors Card (only when completed) -->
      <Transition
        enter-active-class="transition-all duration-600 ease-out delay-300"
        enter-from-class="opacity-0 scale-75 translate-y-8 -rotate-2"
        enter-to-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0 rotate-0"
        leave-to-class="opacity-0 scale-75 translate-y-8 -rotate-2"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-amber-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-amber-300 mb-1">
            {{ configStore.errors }}
          </div>
          <div class="text-xs sm:text-sm text-amber-200/80 font-medium">
            Errores
          </div>
        </div>
      </Transition>
    </div>

    <div class="relative">
      <!-- Counter positioned outside the scrolling container -->
      <div
        class="absolute top-1 right-1 xs:top-2 xs:right-2 sm:top-2 sm:right-2 z-20"
      >
        <div
          class="inline-flex items-center gap-1.5 xs:gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-xl rounded-lg xs:rounded-xl sm:rounded-2xl px-2 py-1.5 xs:px-3 xs:py-2 sm:px-2 sm:py-2 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 min-w-0"
        >
          <!-- Time Counter -->
          <div
            v-if="configStore.type === 'time'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <svg
              class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span class="text-xs xs:text-sm font-bold text-emerald-300"
                >{{ configStore.timeElapsed }}s</span
              >
              <span class="text-xs text-slate-400"
                >/ {{ configStore.selectedTime }}s</span
              >
            </div>
          </div>

          <!-- Words Counter -->
          <div
            v-if="configStore.type === 'words'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <svg
              class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span
                class="text-xs xs:text-sm sm:text-base font-bold text-blue-300"
                >{{ configStore.typedWords }}</span
              >
              <span class="text-xs sm:text-sm text-slate-400"
                >/ {{ configStore.selectedWords }}</span
              >
            </div>
          </div>

          <!-- Characters Counter (default) -->
          <div
            v-if="configStore.type !== 'time' && configStore.type !== 'words'"
            class="flex items-center gap-1.5 sm:gap-2"
          >
            <svg
              class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              ></path>
            </svg>
            <div class="flex items-baseline gap-0.5 xs:gap-1">
              <span
                class="text-xs xs:text-sm sm:text-base font-bold text-purple-300"
                >{{ configStore.userInput.length }}</span
              >
              <span class="text-xs sm:text-sm text-slate-400"
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

      <!-- Pause Overlay positioned outside the scrolling container -->
      <div
        v-if="configStore.isPaused"
        class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl sm:rounded-3xl z-10 pointer-events-none"
      >
        <div class="text-center">
          <div class="mb-4">
            <svg
              class="w-16 h-16 mx-auto text-amber-400 animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </div>
          <div class="text-xl font-semibold text-amber-300 mb-2">Pausado</div>
          <div class="text-sm text-slate-300">Escribe para continuar</div>
        </div>
      </div>

      <div
        ref="typingContainer"
        class="bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-2xl sm:rounded-3xl px-6 py-10 sm:p-10 border border-slate-600/30 backdrop-blur-2xl text-white text-lg sm:text-xl leading-relaxed font-mono select-none relative typing-container shadow-2xl h-[200px] sm:h-[300px]"
        :class="{
          'paused-overlay': configStore.isPaused,
          'overflow-y-auto': !configStore.isPaused,
          'overflow-hidden': configStore.isPaused,
        }"
        @click="focusInput"
      >
        <div
          class="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-500 ease-out progress-glow rounded-full"
          :style="{
            width: `${progressPercentage}%`,
          }"
        ></div>

        <div
          class="relative text-left max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-0"
        >
          <Transition
            enter-active-class="transition-all duration-700 ease-out"
            enter-from-class="opacity-0 translate-y-4 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-4 scale-95"
          >
            <div
              key="text-content"
              class="relative font-mono text-base sm:text-lg lg:text-xl leading-relaxed transition-all duration-300 ease-in-out"
            >
              <span
                v-for="(char, index) in visibleText"
                :key="`${currentTextIndex}-${index}`"
                :class="getCharacterClass(index)"
                :style="{ animationDelay: `${index * 2}ms` }"
              >
                {{ char }}
              </span>

              <!-- <span
                v-if="!isCompleted && userInput.length < visibleText.length"
                class="inline-block w-0.5 h-7 bg-gradient-to-b from-emerald-400 to-cyan-400 cursor-blink ml-0.5 rounded-full shadow-lg"
              ></span> -->
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="mt-8 sm:mt-12 text-center flex gap-4 justify-center">
      <IconButton
        icon="back"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Anterior"
        @click="previous"
      />
      <IconButton
        icon="restart"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Reiniciar"
        @click="restart"
      />

      <!-- Show pause button when not paused -->
      <IconButton
        v-if="!configStore.isPaused"
        icon="pause"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Pausar"
        @click="pause"
      />

      <!-- Show play button when paused -->
      <IconButton
        v-if="configStore.isPaused"
        icon="play"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Continuar"
        @click="play"
      />

      <IconButton
        icon="next"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Siguiente"
        @click="next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import IconButton from "@/components/common/IconButton.vue";
import { paragraphs } from "@/constants/paragraphs";
import { useConfigStore } from "@/stores/config";
import confetti from "canvas-confetti";

// Config store
const configStore = useConfigStore();

// Local component state
const currentTextIndex = ref(0);
const typingInput = ref(null);
const typingContainer = ref(null);

// Current reference text from the collection
const referenceText = computed(() => {
  return paragraphs[currentTextIndex.value];
});

// Set the reference text in the store when it changes
watch(
  referenceText,
  (newText) => {
    configStore.setReferenceText(newText);
  },
  { immediate: true }
);

// Use computed properties from the store
const { totalWords, totalCharacters, typedCharacters, progressPercentage } =
  configStore;

// Local isCompleted that uses the component's referenceText
const isCompleted = computed(() => {
  if (!referenceText.value) return false;

  // Always complete if the entire text is finished, regardless of time/word limits
  if (configStore.userInput.length >= referenceText.value.length) {
    console.log(
      "Text completed! User input length:",
      configStore.userInput.length,
      "Reference text length:",
      referenceText.value.length
    );
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

// Watch for completion and trigger confetti
watch(isCompleted, (completed) => {
  if (completed) {
    console.log("Session completed! Triggering confetti from watcher...");

    // Stop the timer and clear inactivity timer when completed
    if (configStore.timer) {
      clearInterval(configStore.timer);
      configStore.timer = null;
    }
    configStore.clearInactivityTimer();

    // Trigger confetti
    triggerConfetti();
  }
});

// Show all text from the beginning
const visibleText = computed(() => {
  return referenceText.value;
});

// Get the current character index within visible text
const currentCharIndexInVisible = computed(() => {
  return Math.min(userInput.value.length, visibleText.value.length);
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

  // Get the current character element
  const currentCharIndex = configStore.userInput.length;
  const charElements = typingContainer.value.querySelectorAll("span");

  if (charElements[currentCharIndex]) {
    const currentChar = charElements[currentCharIndex];
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
  }
};

const handleTyping = () => {
  // Don't handle typing if session is already completed
  if (isCompleted.value) {
    return;
  }

  // Use the store's handleTyping function with completion callback
  configStore.handleTyping(() => {
    // Trigger confetti celebration when completed
    console.log("Session completed! Triggering confetti...");
    triggerConfetti();
  });

  // Auto-scroll to keep current position visible
  scrollToCurrentPosition();
};

const handleKeydown = (event) => {
  if (event.key === "Backspace" && configStore.userInput.length === 0) {
    event.preventDefault();
  }
};

// Use store functions for timer management
const { startTimer, resetInactivityTimer, clearInactivityTimer } = configStore;

const triggerConfetti = () => {
  // Create multiple bursts of confetti
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire from left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });

    // Fire from right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

const getCharacterClass = (index) => {
  const baseClasses =
    "transition-all duration-300 ease-out select-none transform";

  if (index < configStore.userInput.length) {
    if (configStore.userInput[index] === visibleText.value[index]) {
      return `${baseClasses} text-emerald-300 font-medium scale-105 animate-pulse-once`;
    } else {
      return `${baseClasses} text-red-400 bg-red-900/30 rounded-sm font-medium animate-shake`;
    }
  } else if (index === configStore.userInput.length) {
    return `${baseClasses} text-white bg-emerald-500/20 rounded-sm font-medium animate-glow`;
  } else {
    return `${baseClasses} text-slate-500 font-light hover:text-slate-400`;
  }
};

const restart = () => {
  configStore.resetTypingSession();
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

  // Add a small delay to allow the transition to complete
  setTimeout(() => {
    typingInput.value?.focus();
  }, 200);
};

onMounted(() => {
  typingInput.value?.focus();
});

onUnmounted(() => {
  // Clear any timers from the config store
  if (configStore.timer) {
    clearInterval(configStore.timer);
    configStore.timer = null;
  }
  configStore.clearInactivityTimer();
});
</script>

<style scoped>
@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
  51%,
  100% {
    opacity: 0.3;
    transform: scaleY(0.8);
  }
}

.cursor-blink {
  animation: cursor-blink 1.2s infinite ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse-once {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pulse-once {
  animation: pulse-once 0.4s ease-out;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
    transform: scale(1);
  }
}

.animate-glow {
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes text-reveal {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-text-reveal {
  animation: text-reveal 0.6s ease-out forwards;
}

@keyframes type-flow {
  0% {
    background-color: rgba(34, 197, 94, 0.1);
    transform: scale(1);
  }
  50% {
    background-color: rgba(34, 197, 94, 0.2);
    transform: scale(1.05);
  }
  100% {
    background-color: rgba(34, 197, 94, 0.1);
    transform: scale(1);
  }
}

.typing-container:hover .text-slate-500 {
  color: rgb(148, 163, 184);
  transition: color 0.3s ease;
}

.typing-container:hover {
  border-color: rgba(148, 163, 184, 0.4);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.progress-glow {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(6, 182, 212, 0.4);
}

.char-highlight {
  position: relative;
  z-index: 1;
}

.char-highlight::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.char-highlight:hover::before {
  opacity: 1;
}

@keyframes celebrate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(1deg);
  }
  50% {
    transform: scale(1.05) rotate(-1deg);
  }
  75% {
    transform: scale(1.1) rotate(1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.celebrate {
  animation: celebrate 0.6s ease-in-out;
}

/* Pause overlay styles */
.paused-overlay {
  position: relative;
}

.paused-overlay::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(251, 191, 36, 0.1),
    rgba(245, 158, 11, 0.1),
    rgba(251, 191, 36, 0.1)
  );
  border-radius: inherit;
  z-index: 1;
}

@keyframes pause-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
}

.paused-overlay {
  animation: pause-glow 2s ease-in-out infinite;
}
</style>
