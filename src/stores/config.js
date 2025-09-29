import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useConfigStore = defineStore("config", () => {
  // Configuration state
  const type = ref("time");
  const selectedTime = ref(15);
  const selectedWords = ref(100);
  const selectedContentTypes = ref("punctuation");

  const types = ref(["time", "words"]);
  const contentTypes = ref(["punctuation"]);
  const times = ref([15, 30, 60, 120]);
  const words = ref([10, 25, 50, 100]);

  // Typing state
  const userInput = ref("");
  const startTime = ref(null);
  const timeElapsed = ref(0);
  const timer = ref(null);
  const isPaused = ref(false);
  const inactivityTimer = ref(null);
  const referenceText = ref("");
  const originalReferenceText = ref(""); // Keep track of original text
  const INACTIVITY_TIMEOUT = 3000; // 3 seconds of inactivity

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
    if (!startTime.value || timeElapsed.value === 0) {
      console.log("WPM calculation: No start time or time elapsed is 0");
      return 0;
    }
    const words = userInput.value.trim().split(/\s+/).length;
    const minutes = timeElapsed.value / 60;
    const wpmResult = Math.round(words / minutes);
    console.log("WPM calculation:", {
      words: words,
      timeElapsed: timeElapsed.value,
      minutes: minutes,
      wpm: wpmResult,
    });
    return wpmResult;
  });

  const accuracy = computed(() => {
    if (userInput.value.length === 0) return 100;
    if (!referenceText.value) return 100;
    let correctChars = 0;
    for (let i = 0; i < userInput.value.length; i++) {
      if (userInput.value[i] === referenceText.value[i]) {
        correctChars++;
      }
    }
    return Math.round((correctChars / userInput.value.length) * 100);
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
    console.log("Typed words calculation:", {
      userInput: userInput.value,
      words: words,
      count: words.length,
    });
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
    if (!referenceText.value) {
      console.log("No reference text for error counting");
      return 0;
    }
    let errorCount = 0;
    for (let i = 0; i < userInput.value.length; i++) {
      if (userInput.value[i] !== referenceText.value[i]) {
        errorCount++;
      }
    }
    console.log(
      `Error count: ${errorCount}, userInput length: ${userInput.value.length}, referenceText length: ${referenceText.value.length}`
    );
    return errorCount;
  });

  const isCompleted = computed(() => {
    if (!referenceText.value) return false;

    // Always complete if the entire text is finished, regardless of time/word limits
    if (userInput.value.length >= referenceText.value.length) {
      return true;
    }

    // Time-based completion
    if (type.value === "time") {
      return timeElapsed.value >= selectedTime.value;
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

    // Default: character-based progress
    if (!referenceText.value) return 0;
    return Math.min(
      (userInput.value.length / referenceText.value.length) * 100,
      100
    );
  });

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

        // Check if time limit is reached and complete the session immediately
        if (type.value === "time" && timeElapsed.value >= selectedTime.value) {
          console.log("Time limit reached! Triggering completion...");
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

    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }

    clearInactivityTimer();
  };

  const setReferenceText = (text) => {
    // Always store the original text
    originalReferenceText.value = text;

    // Apply formatting if punctuation mode is NOT selected (deselected)
    if (selectedContentTypes.value === "punctuation") {
      referenceText.value = text; // Show original when selected
    } else {
      referenceText.value = formatReferenceText(text); // Format when deselected
    }
    resetTypingSession();
  };

  // Callback for completion (to be set by component)
  const onComplete = ref(null);

  const formatReferenceText = (text) => {
    let formattedText = text.toLowerCase();

    formattedText = formattedText.normalize("NFD");

    formattedText = formattedText.replace(/[\u0300-\u036f]/g, "");

    formattedText = formattedText.replace(
      /[\.,?!;:\-—"“”‘’'()\[\]{}/&\*@#\$%\^+=_~`<>]/g,
      ""
    );

    formattedText = formattedText.trim();

    return formattedText;
  };

  return {
    // Configuration
    type,
    selectedTime,
    selectedWords,
    selectedContentTypes,
    contentTypes,
    times,
    words,
    types,
    handleType,
    handleTime,
    handleWords,
    handleContentTypes,
    // Typing state
    userInput,
    startTime,
    timeElapsed,
    timer,
    isPaused,
    inactivityTimer,
    referenceText,
    originalReferenceText,

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

    // Functions
    handleTyping,
    startTimer,
    pause,
    play,
    resetTypingSession,
    setReferenceText,
    formatReferenceText,
    clearInactivityTimer,
    resetInactivityTimer,
    onComplete,
  };
});
