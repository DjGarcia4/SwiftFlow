// The running experience total. Kept apart from the results for the same
// reason as the perfect rounds: XP already earned shouldn't vanish when old
// sessions fall off the end of the capped history.
const STORAGE_KEY = "swiftflow_xp";

// null when nothing has been stored yet, so the caller can seed it
export const loadExperience = () => {
  const value = Number(localStorage.getItem(STORAGE_KEY));
  return localStorage.getItem(STORAGE_KEY) !== null && Number.isFinite(value)
    ? value
    : null;
};

export const saveExperience = (xp) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(xp));
  } catch {
    // Storage full or blocked: the total still shows for this session.
  }
};

export const clearExperience = () => {
  localStorage.removeItem(STORAGE_KEY);
};
