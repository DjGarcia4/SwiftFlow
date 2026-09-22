// The letters in spaced review and when each is next due. Kept apart from
// the results because it's a schedule, not a record: it moves forward on
// its own dates, which nothing in the history could reconstruct.
const STORAGE_KEY = "swiftflow_key_review";

export const loadKeyReview = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveKeyReview = (schedule) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch {
    // Storage full or blocked: the schedule still holds for this session.
  }
};

export const clearKeyReview = () => {
  localStorage.removeItem(STORAGE_KEY);
};
