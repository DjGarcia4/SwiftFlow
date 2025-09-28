<template>
  <div class="relative">
    <div
      :class="[
        'grid gap-4 sm:gap-6 text-center mb-8 sm:mb-12',
        isCompleted
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-4',
      ]"
    >
      <!-- WPM Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 scale-75 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-emerald-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-emerald-300 mb-1">
            {{ wpm }}
          </div>
          <div class="text-xs sm:text-sm text-emerald-200/80 font-medium">
            WPM
          </div>
        </div>
      </Transition>

      <!-- Accuracy Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-100"
        enter-from-class="opacity-0 scale-75 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-blue-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-blue-300 mb-1">
            {{ accuracy }}%
          </div>
          <div class="text-xs sm:text-sm text-blue-200/80 font-medium">
            Precisión
          </div>
        </div>
      </Transition>

      <!-- Time Card -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-200"
        enter-from-class="opacity-0 scale-75 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-purple-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-purple-300 mb-1">
            {{ timeElapsed }}s
          </div>
          <div class="text-xs sm:text-sm text-purple-200/80 font-medium">
            Tiempo
          </div>
        </div>
      </Transition>

      <!-- Errors Card (only when completed) -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out delay-300"
        enter-from-class="opacity-0 scale-75 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-4"
      >
        <div
          v-if="isCompleted"
          class="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-amber-400/30 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div class="text-2xl sm:text-3xl font-bold text-amber-300 mb-1">
            {{ errors }}
          </div>
          <div class="text-xs sm:text-sm text-amber-200/80 font-medium">
            Errores
          </div>
        </div>
      </Transition>
    </div>

    <div class="relative">
      <input
        ref="typingInput"
        v-model="userInput"
        @input="handleTyping"
        @keydown="handleKeydown"
        class="absolute inset-0 w-full h-full opacity-0 cursor-default"
        :disabled="isCompleted"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />

      <div
        ref="typingContainer"
        class="bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-600/30 backdrop-blur-2xl text-white text-lg sm:text-xl leading-relaxed font-mono select-none relative typing-container shadow-2xl h-[200px] sm:h-[300px]"
        :class="{
          'paused-overlay': isPaused,
          'overflow-y-auto': !isPaused,
          'overflow-hidden': isPaused,
        }"
        @click="focusInput"
      >
        <div
          class="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-500 ease-out progress-glow rounded-full"
          :style="{
            width: `${(userInput.length / referenceText.length) * 100}%`,
          }"
        ></div>

        <!-- Pause Overlay -->
        <div
          v-if="isPaused"
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
          class="relative text-left max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-0"
        >
          <div
            class="relative font-mono text-base sm:text-lg lg:text-xl leading-relaxed transition-all duration-300 ease-in-out"
          >
            <span
              v-for="(char, index) in visibleText"
              :key="index"
              :class="getCharacterClass(index)"
            >
              {{ char }}
            </span>

            <!-- <span
              v-if="!isCompleted && userInput.length < visibleText.length"
              class="inline-block w-0.5 h-7 bg-gradient-to-b from-emerald-400 to-cyan-400 cursor-blink ml-0.5 rounded-full shadow-lg"
            ></span> -->
          </div>
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
        v-if="!isPaused"
        icon="pause"
        variant="primary"
        size="lg"
        class="group"
        tooltip="Pausar"
        @click="pause"
      />

      <!-- Show play button when paused -->
      <IconButton
        v-if="isPaused"
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import IconButton from "@/components/common/IconButton.vue";
import { paragraphs } from "@/constants/paragraphs";
import confetti from "canvas-confetti";
// Current reference text from the collection
const referenceText = computed(() => {
  return paragraphs[currentTextIndex.value];
});

const userInput = ref("");
const startTime = ref(null);
const timeElapsed = ref(0);
const timer = ref(null);
const typingInput = ref(null);
const typingContainer = ref(null);
const isPaused = ref(false);
const currentTextIndex = ref(0);
const inactivityTimer = ref(null);
const INACTIVITY_TIMEOUT = 3000; // 3 seconds of inactivity

const wpm = computed(() => {
  if (!startTime.value || timeElapsed.value === 0) return 0;
  const words = userInput.value.trim().split(/\s+/).length;
  const minutes = timeElapsed.value / 60;
  return Math.round(words / minutes);
});

const accuracy = computed(() => {
  if (userInput.value.length === 0) return 100;
  let correctChars = 0;
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] === referenceText.value[i]) {
      correctChars++;
    }
  }
  return Math.round((correctChars / userInput.value.length) * 100);
});

const isCompleted = computed(() => {
  return userInput.value.length >= referenceText.value.length;
});

// Additional stats for completion
const totalWords = computed(() => {
  return referenceText.value.trim().split(/\s+/).length;
});

const typedWords = computed(() => {
  return userInput.value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
});

const totalCharacters = computed(() => {
  return referenceText.value.length;
});

const typedCharacters = computed(() => {
  return userInput.value.length;
});

const errors = computed(() => {
  let errorCount = 0;
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] !== referenceText.value[i]) {
      errorCount++;
    }
  }
  return errorCount;
});

// Show all text from the beginning
const visibleText = computed(() => {
  return referenceText.value;
});

// Get the current character index within visible text
const currentCharIndexInVisible = computed(() => {
  return Math.min(userInput.value.length, visibleText.value.length);
});

const focusInput = () => {
  typingInput.value?.focus();
};

const scrollToCurrentPosition = () => {
  if (!typingContainer.value || userInput.value.length === 0) return;

  // Get the current character element
  const currentCharIndex = userInput.value.length;
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
  // Auto-resume if paused (from inactivity or manual pause)
  if (isPaused.value) {
    isPaused.value = false;
    if (startTime.value && userInput.value.length > 0) {
      startTimer();
    }
  }

  if (!startTime.value) {
    startTime.value = Date.now();
    startTimer();
  }

  // Reset inactivity timer on typing activity
  resetInactivityTimer();

  // Auto-scroll to keep current position visible
  scrollToCurrentPosition();

  // Stop timer when completed and trigger confetti
  if (isCompleted.value && timer.value) {
    clearInterval(timer.value);
    timer.value = null;
    clearInactivityTimer();
    // Trigger confetti celebration
    triggerConfetti();
  }
};

const handleKeydown = (event) => {
  if (event.key === "Backspace" && userInput.value.length === 0) {
    event.preventDefault();
  }
};

const startTimer = () => {
  timer.value = setInterval(() => {
    if (startTime.value) {
      timeElapsed.value = Math.floor((Date.now() - startTime.value) / 1000);
    }
  }, 1000);
};

const resetInactivityTimer = () => {
  // Clear existing inactivity timer
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value);
  }

  // Only set inactivity timer if not paused and not completed
  if (!isPaused.value && !isCompleted.value && startTime.value) {
    inactivityTimer.value = setTimeout(() => {
      // Auto-pause after inactivity
      isPaused.value = true;
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    }, INACTIVITY_TIMEOUT);
  }
};

const clearInactivityTimer = () => {
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value);
    inactivityTimer.value = null;
  }
};

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
  const baseClasses = "transition-all duration-200 select-none";

  if (index < userInput.value.length) {
    if (userInput.value[index] === visibleText.value[index]) {
      return `${baseClasses} text-emerald-300 font-medium`;
    } else {
      return `${baseClasses} text-red-400 bg-red-900/30 rounded-sm font-medium`;
    }
  } else if (index === userInput.value.length) {
    return `${baseClasses} text-white bg-emerald-500/20 rounded-sm font-medium`;
  } else {
    return `${baseClasses} text-slate-500 font-light`;
  }
};

const restart = () => {
  userInput.value = "";
  startTime.value = null;
  timeElapsed.value = 0;
  isPaused.value = false;
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  clearInactivityTimer();

  setTimeout(() => {
    typingInput.value?.focus();
  }, 100);
};

const pause = () => {
  if (!isPaused.value && timer.value) {
    isPaused.value = true;
    clearInterval(timer.value);
    timer.value = null;
  }
  clearInactivityTimer();
};

const play = () => {
  if (isPaused.value) {
    isPaused.value = false;
    if (startTime.value && userInput.value.length > 0) {
      // Resume timer from where it was paused
      startTimer();
      // Reset inactivity timer when resuming
      resetInactivityTimer();
    }
    setTimeout(() => {
      typingInput.value?.focus();
    }, 100);
  }
};

const next = () => {
  // Move to next text in collection
  currentTextIndex.value = (currentTextIndex.value + 1) % paragraphs.length;

  // Reset everything for new text
  userInput.value = "";
  startTime.value = null;
  timeElapsed.value = 0;
  isPaused.value = false;

  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  clearInactivityTimer();

  setTimeout(() => {
    typingInput.value?.focus();
  }, 100);
};

const previous = () => {
  // Move to previous text in collection
  currentTextIndex.value =
    currentTextIndex.value === 0
      ? paragraphs.length - 1
      : currentTextIndex.value - 1;

  // Reset everything for new text
  userInput.value = "";
  startTime.value = null;
  timeElapsed.value = 0;
  isPaused.value = false;

  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  clearInactivityTimer();

  setTimeout(() => {
    typingInput.value?.focus();
  }, 100);
};

onMounted(() => {
  typingInput.value?.focus();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  clearInactivityTimer();
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
