// The best run at each kind of session, kept whole -- its text and its
// timeline -- so it can be raced. One per kind, replaced only by a faster
// run, so this stays a handful of entries.
const STORAGE_KEY = "swiftflow_ghosts";

export const loadGhosts = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveGhosts = (ghosts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ghosts));
  } catch {
    // Storage full or blocked: the ghost is lost, the session isn't.
  }
};

export const clearGhosts = () => {
  localStorage.removeItem(STORAGE_KEY);
};
