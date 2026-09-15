// Thin persistence layer for completed-session results, isolated behind a
// small function API so a future backend can replace localStorage without
// touching the store or any component that consumes it.
const STORAGE_KEY = "swiftflow_results";
const MAX_RESULTS = 200;

export const getResults = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Prepends the new result (most recent first) and caps the stored list at
// MAX_RESULTS so localStorage doesn't grow without bound.
export const saveResult = (entry) => {
  const results = [entry, ...getResults()].slice(0, MAX_RESULTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  return results;
};

export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};
