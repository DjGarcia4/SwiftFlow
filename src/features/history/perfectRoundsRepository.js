// The perfect-round tally lives apart from the results because the results
// are capped (see resultsRepository) and this count shouldn't shrink when
// old sessions fall off the end.
const STORAGE_KEY = "swiftflow_perfect_rounds";

// null when nothing has been stored yet, so the caller can tell "never
// counted" (seed it from the history) from "counted, and it's zero".
export const loadPerfectRounds = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const savePerfectRounds = (tally) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tally));
  } catch {
    // Storage full or blocked: the count still shows for this session.
  }
};

export const clearPerfectRounds = () => {
  localStorage.removeItem(STORAGE_KEY);
};
