// The ghost: your best run at a kind of session, replayed. A run is kept as
// the exact text it was on plus a timeline of how far into it you were at
// each moment of active typing, so racing it means the same text and a
// second caret that moves the way you did.

// Modes a ghost makes sense for: a fixed text to race on and an end to
// race to. Zen has no end; the drill's letters change from day to day.
const GHOST_MODES = new Set(["time", "words", "numbers", "quote", "code"]);

// How much text past the ghost's last position a timed run keeps. Racing
// it, you get the same text for as far as the ghost went and a little
// beyond; after that it tops up with fresh text like any timed session.
const TIMED_TEXT_MARGIN = 100;

// One ghost per kind of session -- the same split as the personal bests,
// plus whether punctuation was on, since that changes the text itself.
// Null for a kind that can't have one (and for code on "Todos", which
// isn't one language).
export const ghostKey = ({ mode, modeValue, punctuation }) => {
  if (!GHOST_MODES.has(mode)) return null;
  if (mode === "code" && !modeValue) return null;
  const punct = mode === "code" || punctuation ? "p" : "-";
  return `${mode}:${modeValue ?? ""}:${punct}`;
};

// samples: [[activeMs, inputLength], ...] in time order, one per change.
// Where the ghost is at `ms` of active typing: the length of its input at
// the last change up to then.
export const ghostPositionAt = (samples, ms) => {
  let low = 0;
  let high = samples.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (samples[mid][0] <= ms) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found === -1 ? 0 : samples[found][1];
};

// When the ghost typed its last character
export const ghostFinishMs = (samples) =>
  samples.length ? samples[samples.length - 1][0] : 0;

// What gets stored for a run: the text it raced on (a timed run's only as
// far as it got, plus a margin) and its timeline.
export const buildGhostRun = ({ mode, text, samples }) => {
  const reached = samples.reduce((max, [, length]) => Math.max(max, length), 0);
  return {
    text: mode === "time" ? text.slice(0, reached + TIMED_TEXT_MARGIN) : text,
    samples,
  };
};

// Ahead (positive) or behind (negative) the ghost, in characters
export const ghostLead = (inputLength, ghostPosition) => inputLength - ghostPosition;
