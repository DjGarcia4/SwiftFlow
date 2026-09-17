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

// Per-keystroke timing is the heaviest thing on a result by a wide margin
// (~2.5 KB against ~0.6 KB for everything else), and it's only ever read for
// the newest sessions -- the history panel's key stats look at the last 30.
// Past this point it's weight nobody reads, re-serialized on every save, so
// it gets dropped while the session itself is kept: wpm, accuracy, key
// errors and confusions stay forever, and so do records, streaks and
// achievements. Deliberately wider than the read window, with room to raise
// it before this has to move too.
const TIMING_RETENTION = 40;
const TIMING_FIELDS = ["keyTiming", "bigramTiming"];

const withoutTiming = (result) => {
  if (!TIMING_FIELDS.some((field) => field in result)) return result;
  const trimmed = { ...result };
  for (const field of TIMING_FIELDS) delete trimmed[field];
  return trimmed;
};

// Prepends the new result (most recent first) and caps the stored list at
// MAX_RESULTS so localStorage doesn't grow without bound.
export const saveResult = (entry) => {
  const results = [entry, ...getResults()]
    .slice(0, MAX_RESULTS)
    .map((result, index) => (index < TIMING_RETENTION ? result : withoutTiming(result)));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // Out of quota (or storage blocked): drop every bit of timing and try
    // once more. Losing the slow-key data beats throwing from here, which
    // would take down the results screen mid-render.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results.map(withoutTiming)));
    } catch {
      // Nothing left to trim. The session still shows; it just won't persist.
    }
  }

  return results;
};

// Writes a whole list at once, for an import. Same cap and same timing
// trimming as a normal save, so a restored history can't smuggle in more
// than the app would ever store itself.
export const replaceResults = (entries) => {
  const results = entries
    .slice(0, MAX_RESULTS)
    .map((result, index) => (index < TIMING_RETENTION ? result : withoutTiming(result)));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results.map(withoutTiming)));
    } catch {
      // Nothing more to trim; the import stays in memory for this session.
    }
  }

  return results;
};

export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};
