// Persists the sound on/off preferences (master + one per sound category),
// isolated behind its own module the same way config/results are elsewhere
// in this app.
const STORAGE_KEY = "swiftflow_sound_settings";

const DEFAULTS = {
  soundEnabled: true,
  keystrokeSound: true,
  errorSound: true,
  celebrationSound: true,
};

export const loadSoundSettings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULTS };

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveSoundSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
