import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { codeLanguages } from "@/features/typing-test/content/code";
import {
  computeWpm,
  computeAccuracy,
  computeErrors,
  computeStreak,
} from "@/features/typing-test/utils/typingMetrics";
import { formatReferenceText } from "@/features/typing-test/utils/textFormat";

export const useConfigStore = defineStore("config", () => {
  // Configuration state
  const type = ref("time");
  const selectedTime = ref(15);
  const selectedWords = ref(100);
  const selectedContentTypes = ref("punctuation");
  const selectedCodeLanguage = ref(null); // null = "Todos" (mixed languages)

  const types = ref(["time", "words", "quote", "code", "zen"]);
  const contentTypes = ref(["punctuation"]);
  const times = ref([15, 30, 60, 120]);
  const words = ref([10, 25, 50, 100]);
  const languages = ref(codeLanguages);

  // Typing state
  const userInput = ref("");
  const startTime = ref(null);
  const timeElapsed = ref(0);
  const timer = ref(null);
  const isPaused = ref(false);
  const inactivityTimer = ref(null);
  const referenceText = ref("");
  const originalReferenceText = ref(""); // Keep track of original text
  const zenFinished = ref(false); // Manually ended a "zen" (no limit) session
  const wpmHistory = ref([]); // { time, wpm, errors } samples for the results chart
  const INACTIVITY_TIMEOUT = 3000; // 3 seconds of inactivity

  // Momentum state (best WPM record + live streak)
  const bestWpm = ref(Number(localStorage.getItem("swiftflow_best_wpm")) || 0);

  // Configuration handlers
  const handleType = (selectedType) => {
    type.value = selectedType;
    resetTypingSession();
  };

  const handleTime = (newTime) => {
    selectedTime.value = newTime;
    resetTypingSession();
  };

  const handleWords = (newWords) => {
    selectedWords.value = newWords;
    resetTypingSession();
  };

  const handleCodeLanguage = (language) => {
    // Clicking "Todos" passes null; clicking it again while already
    // selected also falls back to null (mixed languages).
    selectedCodeLanguage.value =
      language === selectedCodeLanguage.value ? null : language;
    resetTypingSession();
  };

  const handleContentTypes = (selectedContentType) => {
    if (selectedContentType === selectedContentTypes.value) {
      selectedContentTypes.value = null;
    } else {
      selectedContentTypes.value = selectedContentType;
    }

    // Re-format the text based on the new selection
    if (originalReferenceText.value) {
      if (selectedContentTypes.value === "punctuation") {
        referenceText.value = originalReferenceText.value; // Show original when selected
      } else {
        referenceText.value = formatReferenceText(originalReferenceText.value); // Format when deselected
      }
    }

    resetTypingSession();
  };

  // Typing computed properties
  const wpm = computed(() => {
    if (!startTime.value) return 0;
    return computeWpm(userInput.value, timeElapsed.value);
  });

  const accuracy = computed(() => {
    return computeAccuracy(userInput.value, referenceText.value);
  });

  const totalWords = computed(() => {
    if (!referenceText.value) return 0;
    return referenceText.value.trim().split(/\s+/).length;
  });

  const typedWords = computed(() => {
    const words = userInput.value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  });

  const totalCharacters = computed(() => {
    if (!referenceText.value) return 0;
    return referenceText.value.length;
  });

  const typedCharacters = computed(() => {
    return userInput.value.length;
  });

  const errors = computed(() => {
    return computeErrors(userInput.value, referenceText.value);
  });

  const isBeatingBest = computed(() => {
    return bestWpm.value > 0 && wpm.value > bestWpm.value;
  });

  const updateBestWpm = () => {
    if (wpm.value > bestWpm.value) {
      bestWpm.value = wpm.value;
      localStorage.setItem("swiftflow_best_wpm", String(bestWpm.value));
    }
  };

  const currentStreak = computed(() => {
    return computeStreak(userInput.value, referenceText.value);
  });

  const isCompleted = computed(() => {
    if (!referenceText.value) return false;

    // Time-based completion: the text keeps getting extended as the user
    // approaches the end (see extendReferenceText), so completion here is
    // purely a function of the clock — it should never end early just
    // because a fast typist reached the end of the current text.
    if (type.value === "time") {
      return timeElapsed.value >= selectedTime.value;
    }

    // Zen mode has no limit — the text also keeps extending forever, and
    // the session only ends when the user explicitly finishes it.
    if (type.value === "zen") {
      return zenFinished.value;
    }

    // Always complete if the entire text is finished, regardless of word limits
    if (userInput.value.length >= referenceText.value.length) {
      return true;
    }

    // Words-based completion
    if (type.value === "words") {
      return typedWords.value >= selectedWords.value;
    }

    // Default: complete when all text is typed
    return userInput.value.length >= referenceText.value.length;
  });

  const progressPercentage = computed(() => {
    if (type.value === "time") {
      return Math.min((timeElapsed.value / selectedTime.value) * 100, 100);
    }

    if (type.value === "words") {
      return Math.min((typedWords.value / selectedWords.value) * 100, 100);
    }

    // Zen mode has no target to fill toward
    if (type.value === "zen") {
      return 0;
    }

    // Default: character-based progress
    if (!referenceText.value) return 0;
    return Math.min((userInput.value.length / referenceText.value.length) * 100, 100);
  });

  // Manually ends a "zen" session (no time/word limit to trigger completion).
  const finishZen = () => {
    zenFinished.value = true;
  };

  // Typing functions
  const startTimer = () => {
    // Don't start timer if session is already completed
    if (isCompleted.value) {
      return;
    }

    // Clear any existing timer first
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }

    timer.value = setInterval(() => {
      if (startTime.value && !isPaused.value && !isCompleted.value) {
        timeElapsed.value = Math.floor((Date.now() - startTime.value) / 1000);
        recordWpmSample();

        // Check if time limit is reached and complete the session immediately
        if (type.value === "time" && timeElapsed.value >= selectedTime.value) {
          clearInterval(timer.value);
          timer.value = null;
          clearInactivityTimer();
          // Trigger completion callback if provided
          if (onComplete.value) {
            onComplete.value();
          }
          return; // Exit the interval immediately
        }
      }
    }, 1000);
  };

  // Snapshots the current wpm/errors for the results chart. Called once per
  // second while typing, and once more right when a session completes (so
  // the chart's last point matches the final stats exactly).
  const recordWpmSample = () => {
    wpmHistory.value.push({
      time: timeElapsed.value,
      wpm: wpm.value,
      errors: errors.value,
    });
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
      inactivityTimer.value = null;
    }
  };

  const resetInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimer.value = setTimeout(() => {
      isPaused.value = true;
    }, INACTIVITY_TIMEOUT);
  };

  const handleTyping = (onCompleteCallback) => {
    // Don't start timer if session is already completed
    if (isCompleted.value) {
      return;
    }

    // Set the completion callback
    onComplete.value = onCompleteCallback;

    // Auto-resume if paused (from inactivity or manual pause)
    if (isPaused.value) {
      isPaused.value = false;
      if (startTime.value && userInput.value.length > 0 && !isCompleted.value) {
        startTimer();
      }
    }

    if (!startTime.value && !isCompleted.value) {
      startTime.value = Date.now();
      startTimer();
    }

    // Reset inactivity timer on typing activity (only if not completed)
    if (!isCompleted.value) {
      resetInactivityTimer();
    }

    // Check for completion (for non-time-based completion)
    if (isCompleted.value && type.value !== "time") {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
      clearInactivityTimer();
      // Trigger completion callback
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }
  };

  const pause = () => {
    isPaused.value = true;
    clearInactivityTimer();
  };

  const play = () => {
    isPaused.value = false;
    if (startTime.value && userInput.value.length > 0) {
      startTimer();
    }
  };

  const resetTypingSession = () => {
    userInput.value = "";
    startTime.value = null;
    timeElapsed.value = 0;
    isPaused.value = false;
    zenFinished.value = false;
    wpmHistory.value = [];

    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }

    clearInactivityTimer();
  };

  const setReferenceText = (text) => {
    // Always store the original text
    originalReferenceText.value = text;

    // Code is case- and symbol-sensitive — stripping punctuation or
    // lowercasing it would break the syntax, so it always stays as-is.
    if (type.value === "code" || selectedContentTypes.value === "punctuation") {
      referenceText.value = text; // Show original when selected
    } else {
      referenceText.value = formatReferenceText(text); // Format when deselected
    }
    resetTypingSession();
  };

  // Appends more text to the current reference text WITHOUT resetting the
  // typing session — used in "time" mode so a fast typist never runs out
  // of text before the selected time is up.
  const extendReferenceText = (extraText) => {
    originalReferenceText.value = `${originalReferenceText.value} ${extraText}`;

    if (selectedContentTypes.value === "punctuation") {
      referenceText.value = `${referenceText.value} ${extraText}`;
    } else {
      referenceText.value = `${referenceText.value} ${formatReferenceText(extraText)}`;
    }
  };

  // Callback for completion (to be set by component)
  const onComplete = ref(null);

  return {
    // Configuration
    type,
    selectedTime,
    selectedWords,
    selectedContentTypes,
    selectedCodeLanguage,
    contentTypes,
    times,
    words,
    languages,
    types,
    handleType,
    handleTime,
    handleWords,
    handleContentTypes,
    handleCodeLanguage,
    // Typing state
    userInput,
    startTime,
    timeElapsed,
    timer,
    isPaused,
    inactivityTimer,
    referenceText,
    originalReferenceText,
    zenFinished,
    wpmHistory,

    // Computed properties
    wpm,
    accuracy,
    totalWords,
    typedWords,
    totalCharacters,
    typedCharacters,
    errors,
    isCompleted,
    progressPercentage,
    bestWpm,
    isBeatingBest,
    updateBestWpm,
    currentStreak,

    // Functions
    handleTyping,
    startTimer,
    pause,
    play,
    resetTypingSession,
    setReferenceText,
    extendReferenceText,
    finishZen,
    recordWpmSample,
    clearInactivityTimer,
    resetInactivityTimer,
    onComplete,
  };
});
