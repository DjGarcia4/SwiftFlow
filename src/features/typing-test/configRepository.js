// Persists the user's mode/settings selection so it survives a reload,
// isolated behind its own module the same way results/history are.
import {
  normalizeDrillKeys,
  normalizeDrillWords,
} from "@/features/typing-test/content/drill";
import { isLayoutId } from "@/features/typing-test/utils/keyboardLayouts";
import { isStrictMode, isMinAccuracy } from "@/features/typing-test/utils/strictModes";
import { DICTATION_SENTENCE_COUNTS } from "@/features/typing-test/content/dictation";

// How fast the dictation's voice speaks
export const DICTATION_RATES = { slow: 0.75, normal: 0.95, fast: 1.15 };

const STORAGE_KEY = "swiftflow_config";

// More than a handful of target keys isn't a drill any more, it's a word
// test with extra steps.
const MAX_DRILL_KEYS = 5;

const DEFAULTS = {
  type: "time",
  selectedTime: 15,
  selectedWords: 100,
  selectedContentTypes: "punctuation",
  selectedCodeLanguage: null,
  drillKeys: [],
  showKeyboard: null, // null = only while drilling
  pacerWpm: null, // null = Auto
  blindMode: false,
  selectedCustomTextId: null,
  drillWords: [], // non-empty: the drill is on these words, not letters
  fingerColors: false,
  keyboardLayout: null, // null = guessed from the browser's language
  strictMode: null, // "sudden-death" | "must-correct"
  minAccuracy: null, // 90 | 95 | 98
  dictationSentences: 3,
  dictationRate: "normal",
};

export const loadConfig = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULTS };

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// Falls back to defaults for any field that no longer matches a valid
// option — e.g. the saved code language isn't in the current content bank.
export const sanitizeConfig = (config, { types, times, words, languages }) => ({
  type: types.includes(config.type) ? config.type : DEFAULTS.type,
  selectedTime: times.includes(config.selectedTime)
    ? config.selectedTime
    : DEFAULTS.selectedTime,
  selectedWords: words.includes(config.selectedWords)
    ? config.selectedWords
    : DEFAULTS.selectedWords,
  selectedContentTypes:
    config.selectedContentTypes === "punctuation" || config.selectedContentTypes === null
      ? config.selectedContentTypes
      : DEFAULTS.selectedContentTypes,
  selectedCodeLanguage:
    config.selectedCodeLanguage === null ||
    languages.includes(config.selectedCodeLanguage)
      ? config.selectedCodeLanguage
      : null,
  drillKeys: normalizeDrillKeys(config.drillKeys).slice(0, MAX_DRILL_KEYS),
  showKeyboard: typeof config.showKeyboard === "boolean" ? config.showKeyboard : null,
  pacerWpm:
    Number.isInteger(config.pacerWpm) && config.pacerWpm >= 10 && config.pacerWpm <= 250
      ? config.pacerWpm
      : null,
  blindMode: config.blindMode === true,
  // Checked against the saved texts where they're loaded; a stale id just
  // falls back to the first one there
  selectedCustomTextId:
    typeof config.selectedCustomTextId === "string" ? config.selectedCustomTextId : null,
  drillWords: normalizeDrillWords(config.drillWords),
  fingerColors: config.fingerColors === true,
  keyboardLayout: isLayoutId(config.keyboardLayout) ? config.keyboardLayout : null,
  strictMode: isStrictMode(config.strictMode) ? config.strictMode : null,
  minAccuracy: isMinAccuracy(config.minAccuracy) ? config.minAccuracy : null,
  dictationSentences: DICTATION_SENTENCE_COUNTS.includes(config.dictationSentences)
    ? config.dictationSentences
    : DEFAULTS.dictationSentences,
  dictationRate: Object.hasOwn(DICTATION_RATES, config.dictationRate)
    ? config.dictationRate
    : DEFAULTS.dictationRate,
});
