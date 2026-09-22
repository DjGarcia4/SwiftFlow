import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { codeLanguages } from "@/features/typing-test/content/code";
import { normalizeDrillKeys } from "@/features/typing-test/content/drill";
import {
  computeWpm,
  computeRawWpm,
  computeAccuracy,
  computeErrors,
  computeStreak,
  diffKeystrokes,
  isTransposition,
  isUsableInterval,
} from "@/features/typing-test/utils/typingMetrics";
import { formatReferenceText } from "@/features/typing-test/utils/textFormat";
import {
  loadConfig,
  saveConfig,
  sanitizeConfig,
} from "@/features/typing-test/configRepository";

const BEST_WPM_KEY = "swiftflow_best_wpm_v3";

// Kept in step with the cap in configRepository's sanitizeConfig.
const MAX_DRILL_KEYS = 5;

// Below this much typing time, live wpm is computed as if this much had
// passed — otherwise the first couple of keystrokes show absurd spikes.
const MIN_LIVE_WPM_MS = 1000;

export const useConfigStore = defineStore("config", () => {
  // "weekly" is the shared weekly challenge: a real mode for storing and
  // filtering results, but only offered in the bar while it's being played
  // (it's started from the challenges)
  const types = ref([
    "time",
    "words",
    "numbers",
    "quote",
    "code",
    "zen",
    "drill",
    "weekly",
  ]);
  const contentTypes = ref(["punctuation"]);
  const times = ref([15, 30, 60, 120]);
  const words = ref([10, 25, 50, 100]);
  const languages = ref(codeLanguages);

  // Configuration state — restored from the last saved selection so
  // reloading the page doesn't reset it back to the defaults.
  const savedConfig = sanitizeConfig(loadConfig(), {
    types: types.value,
    times: times.value,
    words: words.value,
    languages: languages.value,
  });

  const type = ref(savedConfig.type);
  const selectedTime = ref(savedConfig.selectedTime);
  const selectedWords = ref(savedConfig.selectedWords);
  const selectedContentTypes = ref(savedConfig.selectedContentTypes);
  const selectedCodeLanguage = ref(savedConfig.selectedCodeLanguage); // null = "Todos" (mixed languages)
  // Keys the training mode aims at. Empty means "work it out from my
  // history", which is what it does until the list is edited by hand.
  const drillKeys = ref(savedConfig.drillKeys);
  // The on-screen keyboard: true/false once chosen, null until then, which
  // shows it only in the drill -- the mode where looking at the keys is the
  // point.
  const showKeyboard = ref(savedConfig.showKeyboard);
  const keyboardVisible = computed(() => showKeyboard.value ?? type.value === "drill");
  // The pacer's speed in wpm, or null for "Auto" (a notch above your
  // recent average)
  const pacerWpm = ref(savedConfig.pacerWpm);
  // "Sin red": nothing on screen gives a mistake away until the results
  const blindMode = ref(savedConfig.blindMode);

  const persistConfig = () => {
    saveConfig({
      type: type.value,
      selectedTime: selectedTime.value,
      selectedWords: selectedWords.value,
      selectedContentTypes: selectedContentTypes.value,
      selectedCodeLanguage: selectedCodeLanguage.value,
      drillKeys: drillKeys.value,
      showKeyboard: showKeyboard.value,
      pacerWpm: pacerWpm.value,
      blindMode: blindMode.value,
    });
  };

  // Turning one kind of race on turns the other off: two extra carets at
  // once would be noise, not a race. Picking the one that's on turns it off.
  const toggleRaceMode = (mode) => {
    raceMode.value = raceMode.value === mode ? null : mode;
  };

  const toggleBlindMode = () => {
    blindMode.value = !blindMode.value;
    persistConfig();
  };

  const setPacerWpm = (wpm) => {
    pacerWpm.value = wpm;
    raceMode.value = "pacer";
    persistConfig();
  };

  // Doesn't touch the session: it's only about what's drawn on screen.
  const toggleKeyboard = () => {
    showKeyboard.value = !keyboardVisible.value;
    persistConfig();
  };

  // Typing state
  const userInput = ref("");
  const startTime = ref(null);
  const timeElapsed = ref(0); // Whole seconds, for the on-screen counter and time limits
  const elapsedMs = ref(0); // Precise active typing time, used for wpm
  const lastKeystrokeAt = ref(null);
  const timer = ref(null);
  const isPaused = ref(false);
  const inactivityTimer = ref(null);
  const referenceText = ref("");
  const originalReferenceText = ref(""); // Keep track of original text
  const zenFinished = ref(false); // Manually ended a "zen" (no limit) session
  const endedEarly = ref(false); // Manually ended any other mode before its limit (Esc twice)
  const pausedAt = ref(null); // When the current pause started, to exclude it from the clock
  const wpmHistory = ref([]); // { time, wpm, errors } samples for the results chart
  const INACTIVITY_TIMEOUT = 3000; // 3 seconds of inactivity

  // Per-keystroke session stats. Unlike errors/accuracy (computed from the
  // final input), these also remember mistakes that were later corrected
  // with backspace, and which expected key each mistake was on.
  const keystrokes = ref(0);
  const errorKeystrokes = ref(0);
  const maxStreak = ref(0);
  const keyAttempts = ref({}); // expected char -> times it was typed
  const missedKeys = ref({}); // expected char -> times it was mistyped
  // What was pressed instead, keyed by the two characters back to back
  // ("rt" = meant to type r, pressed t). Knowing the wrong key turns "you
  // miss the r" into "you hit the t instead", which is a different fix.
  const confusions = ref({});
  // Reference bigrams that came out backwards ("ue" typed as "eu"), kept
  // apart from confusions because the fix is rhythm, not finger placement.
  const transpositions = ref({});
  // How long each key and each transition takes, as [totalMs, count]. This
  // is speed, not accuracy: the keys that slow you down are rarely the ones
  // you get wrong, and nothing else here can see them.
  const keyTiming = ref({});
  const bigramTiming = ref({});
  // A zen session has no limit; past this many distinct pairs the tail is
  // statistically dead anyway. Pairs already being tracked keep adding up.
  const MAX_TRACKED_BIGRAMS = 300;
  // The previous keystroke, or null at the start of a session. Held so a
  // mistake can be compared against the one before it -- a swap only shows
  // up as a pair -- and so the gap to the next one can be measured.
  const lastTyped = ref(null); // { index, expected, typed, correct, elapsedMs }
  // [activeMs, inputLength] at every change: the run's timeline, which is
  // what a ghost replays.
  const progressSamples = ref([]);
  // What a run races, if anything: "ghost" (your record's pace) or "pacer"
  // (a steady speed). Kept for the visit, not saved -- it's a thing you
  // choose to do, not a setting. The pacer's speed is a setting, though.
  const raceMode = ref(null);

  // Momentum state (best WPM record + live streak)
  // Stored under a versioned key: wpm used to be measured differently and
  // those older records aren't comparable (see METRICS_VERSION).
  localStorage.removeItem("swiftflow_best_wpm");
  localStorage.removeItem("swiftflow_best_wpm_v2");
  const bestWpm = ref(Number(localStorage.getItem(BEST_WPM_KEY)) || 0);

  // Configuration handlers
  const handleDrillKeys = (keys) => {
    drillKeys.value = normalizeDrillKeys(keys).slice(0, MAX_DRILL_KEYS);
    persistConfig();
    resetTypingSession();
  };

  // Where a drill was started from, so finishing it can offer the way back
  const previousType = ref(null);

  const handleType = (selectedType) => {
    if (selectedType === "drill" && type.value !== "drill")
      previousType.value = type.value;
    type.value = selectedType;
    persistConfig();
    resetTypingSession();
  };

  const handleTime = (newTime) => {
    selectedTime.value = newTime;
    persistConfig();
    resetTypingSession();
  };

  const handleWords = (newWords) => {
    selectedWords.value = newWords;
    persistConfig();
    resetTypingSession();
  };

  const handleCodeLanguage = (language) => {
    // Clicking "Todos" passes null; clicking it again while already
    // selected also falls back to null (mixed languages).
    selectedCodeLanguage.value =
      language === selectedCodeLanguage.value ? null : language;
    persistConfig();
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

    persistConfig();
    resetTypingSession();
  };

  // Typing computed properties
  const wpmElapsedMs = computed(() =>
    isCompleted.value ? elapsedMs.value : Math.max(elapsedMs.value, MIN_LIVE_WPM_MS)
  );

  const wpm = computed(() => {
    if (!startTime.value) return 0;
    return computeWpm(userInput.value, referenceText.value, wpmElapsedMs.value);
  });

  const rawWpm = computed(() => {
    if (!startTime.value) return 0;
    return computeRawWpm(keystrokes.value, wpmElapsedMs.value);
  });

  const accuracy = computed(() => {
    return computeAccuracy(keystrokes.value, errorKeystrokes.value);
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
      localStorage.setItem(BEST_WPM_KEY, String(bestWpm.value));
    }
  };

  const currentStreak = computed(() => {
    return computeStreak(userInput.value, referenceText.value);
  });

  const isCompleted = computed(() => {
    if (!referenceText.value) return false;

    if (endedEarly.value) return true;

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

    // Every other mode (words/numbers texts are generated with exactly the
    // selected count) completes once the whole text has been typed — not as
    // soon as the last word is started.
    return userInput.value.length >= referenceText.value.length;
  });

  const progressPercentage = computed(() => {
    if (type.value === "time") {
      return Math.min((timeElapsed.value / selectedTime.value) * 100, 100);
    }

    if (type.value === "words" || type.value === "numbers") {
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
    freezeClock();
  };

  // Ends the current session right away, whatever the mode. Zen sessions
  // finish normally; any other mode is flagged as ended early so the caller
  // can show the results without counting it as a real attempt.
  const endSession = () => {
    if (!startTime.value || isCompleted.value) return;
    if (type.value === "zen") {
      finishZen();
    } else {
      endedEarly.value = true;
      freezeClock();
    }
  };

  // The paused moment while paused, otherwise now.
  const clockNow = () => pausedAt.value ?? Date.now();

  const setElapsedMs = (ms) => {
    elapsedMs.value = Math.max(0, ms);
    timeElapsed.value = Math.floor(elapsedMs.value / 1000);
  };

  // Pins the final session time once it's over. A timed session lasted
  // exactly its limit; anything else ends at the last keystroke, so time
  // spent afterwards (e.g. reaching for the "finish" button) doesn't count.
  const freezeClock = () => {
    if (!startTime.value) return;
    if (type.value === "time" && !endedEarly.value) {
      setElapsedMs(selectedTime.value * 1000);
    } else if (lastKeystrokeAt.value) {
      setElapsedMs(lastKeystrokeAt.value - startTime.value);
    }
  };

  const addInterval = (map, key, ms) => {
    const entry = map.value[key];
    if (entry) {
      entry[0] += ms;
      entry[1]++;
    } else {
      map.value[key] = [ms, 1];
    }
  };

  watch(
    userInput,
    (next, prev) => {
      const strokes = diffKeystrokes(prev ?? "", next, referenceText.value);
      // Measured on the active clock rather than the wall clock: elapsedMs
      // already has every pause subtracted out, so an interval taken from it
      // simply cannot span one -- no special case for resuming, and no
      // dependency on whether this watcher runs before or after the resume.
      const activeElapsed = startTime.value ? clockNow() - startTime.value : 0;
      // One timestamp can't be shared out across several characters. More
      // than one at a time means a paste, an IME or a swipe -- not typing.
      const timeable = strokes.length === 1;

      for (const stroke of strokes) {
        const { expected, correct } = stroke;
        keystrokes.value++;
        keyAttempts.value[expected] = (keyAttempts.value[expected] || 0) + 1;
        if (!correct) {
          errorKeystrokes.value++;
          missedKeys.value[expected] = (missedKeys.value[expected] || 0) + 1;

          const pair = expected + stroke.typed;
          confusions.value[pair] = (confusions.value[pair] || 0) + 1;

          if (isTransposition(lastTyped.value, stroke)) {
            // Keyed by what the text asked for, so the tip can show the
            // swap as a plain string reversal.
            const swapped = lastTyped.value.expected + expected;
            transpositions.value[swapped] = (transpositions.value[swapped] || 0) + 1;
          }
        }
        const previous = lastTyped.value;
        // Only a gap between two adjacent, correct keystrokes says anything
        // about a key: one that ends on a wrong key measures a different key
        // than the one asked for, and one that starts on a wrong key is
        // mostly the moment spent noticing.
        if (
          timeable &&
          previous &&
          stroke.correct &&
          previous.correct &&
          stroke.index === previous.index + 1
        ) {
          const interval = Math.round(activeElapsed - previous.elapsedMs);
          if (isUsableInterval(interval)) {
            addInterval(keyTiming, expected, interval);
            const pair = previous.expected + expected;
            if (
              bigramTiming.value[pair] ||
              Object.keys(bigramTiming.value).length < MAX_TRACKED_BIGRAMS
            ) {
              addInterval(bigramTiming, pair, interval);
            }
          }
        }

        lastTyped.value = { ...stroke, elapsedMs: activeElapsed };
      }
      maxStreak.value = Math.max(maxStreak.value, currentStreak.value);
      if (next.length || prev)
        progressSamples.value.push([Math.round(activeElapsed), next.length]);

      if (next.length > 0) {
        lastKeystrokeAt.value = Date.now();
        if (startTime.value) setElapsedMs(clockNow() - startTime.value);
      }
      if (isCompleted.value && type.value !== "time") freezeClock();
    },
    { flush: "sync" }
  );

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
        setElapsedMs(Date.now() - startTime.value);
        if (type.value === "time" && timeElapsed.value >= selectedTime.value) {
          freezeClock();
        }
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
      time: Math.round(elapsedMs.value / 100) / 10,
      wpm: wpm.value,
      errors: errors.value,
    });
  };

  // Pausing freezes the clock: remember when it started, and on resume push
  // startTime forward by that long so the paused stretch doesn't count
  // towards timeElapsed (and so doesn't drag wpm down).
  const markPaused = (at = Date.now()) => {
    if (isPaused.value) return;
    isPaused.value = true;
    pausedAt.value = at;
    if (startTime.value) setElapsedMs(at - startTime.value);
  };

  const resumeClock = () => {
    if (pausedAt.value && startTime.value) {
      const pausedFor = Date.now() - pausedAt.value;
      startTime.value += pausedFor;
      // Keep the last keystroke at the same point of active typing time
      // (unless it's the keystroke that's resuming the session right now).
      if (lastKeystrokeAt.value && lastKeystrokeAt.value <= pausedAt.value) {
        lastKeystrokeAt.value += pausedFor;
      }
    }
    pausedAt.value = null;
    isPaused.value = false;
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
      inactivityTimer.value = null;
    }
  };

  const resetInactivityTimer = () => {
    clearInactivityTimer();
    // An idle pause freezes the clock back at the last keystroke, so the
    // idle seconds before it kicked in don't count either.
    inactivityTimer.value = setTimeout(() => {
      markPaused(lastKeystrokeAt.value ?? Date.now());
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
      resumeClock();
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
    markPaused();
    clearInactivityTimer();
  };

  const play = () => {
    resumeClock();
    if (startTime.value && userInput.value.length > 0) {
      startTimer();
    }
  };

  const resetTypingSession = () => {
    userInput.value = "";
    startTime.value = null;
    timeElapsed.value = 0;
    elapsedMs.value = 0;
    lastKeystrokeAt.value = null;
    isPaused.value = false;
    pausedAt.value = null;
    zenFinished.value = false;
    endedEarly.value = false;
    wpmHistory.value = [];
    keystrokes.value = 0;
    errorKeystrokes.value = 0;
    maxStreak.value = 0;
    keyAttempts.value = {};
    missedKeys.value = {};
    confusions.value = {};
    transpositions.value = {};
    keyTiming.value = {};
    bigramTiming.value = {};
    lastTyped.value = null;
    progressSamples.value = [];

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
    //
    // The drill is exempt for a different reason: its text is already plain
    // lowercase words, so formatting would do nothing except strip the
    // accents — and drilling the Á with every á removed practices nothing.
    //
    // The weekly challenge, because it has to be the same text for everyone
    // whatever their punctuation setting.
    if (
      type.value === "code" ||
      type.value === "drill" ||
      type.value === "weekly" ||
      selectedContentTypes.value === "punctuation"
    ) {
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
    drillKeys,
    previousType,
    showKeyboard,
    keyboardVisible,
    toggleKeyboard,
    contentTypes,
    times,
    words,
    languages,
    types,
    handleType,
    handleDrillKeys,
    handleTime,
    handleWords,
    handleContentTypes,
    handleCodeLanguage,
    // Typing state
    userInput,
    startTime,
    timeElapsed,
    elapsedMs,
    timer,
    isPaused,
    inactivityTimer,
    referenceText,
    originalReferenceText,
    zenFinished,
    endedEarly,
    wpmHistory,
    keystrokes,
    errorKeystrokes,
    maxStreak,
    keyAttempts,
    missedKeys,
    confusions,
    transpositions,
    keyTiming,
    bigramTiming,
    progressSamples,
    raceMode,
    toggleRaceMode,
    pacerWpm,
    setPacerWpm,
    blindMode,
    toggleBlindMode,

    // Computed properties
    wpm,
    rawWpm,
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
    endSession,
    recordWpmSample,
    clearInactivityTimer,
    resetInactivityTimer,
    onComplete,
  };
});
