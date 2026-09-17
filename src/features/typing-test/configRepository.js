// Persists the user's mode/settings selection so it survives a reload,
// isolated behind its own module the same way results/history are.
import { normalizeDrillKeys } from "@/features/typing-test/content/drill";

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
});
