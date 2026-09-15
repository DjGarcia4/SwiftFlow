// Persists the user's mode/settings selection so it survives a reload,
// isolated behind its own module the same way results/history are.
const STORAGE_KEY = "swiftflow_config";

const DEFAULTS = {
  type: "time",
  selectedTime: 15,
  selectedWords: 100,
  selectedContentTypes: "punctuation",
  selectedCodeLanguage: null,
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
});
