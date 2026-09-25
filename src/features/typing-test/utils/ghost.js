// The ghost: your best run at a kind of session, replayed as a pace. A run
// is kept as a timeline of how many characters in you were at each moment
// of active typing; racing it, on a fresh text each time, a second caret
// moves through that text the way you moved through yours.

// Modes a ghost makes sense for: ones with an end to race to, on text of a
// comparable kind. Zen has no end; the drill's letters change day to day.
const GHOST_MODES = new Set([
  "time",
  "words",
  "numbers",
  "quote",
  "classics",
  "code",
  "weekly",
  "custom",
]);

// One ghost per kind of session -- the same split as the personal bests,
// plus whether punctuation was on, since that changes the text itself.
// Null for a kind that can't have one (and for code on "Todos", which
// isn't one language).
export const ghostKey = ({ mode, modeValue, punctuation }) => {
  if (!GHOST_MODES.has(mode)) return null;
  if (mode === "code" && !modeValue) return null;
  // Code and the weekly text are typed as they come, whatever the setting
  const punct =
    mode === "code" || mode === "weekly" || mode === "custom" || punctuation ? "p" : "-";
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

// Its average speed over the whole run, in characters per millisecond
const ghostPace = (samples) => {
  const finish = ghostFinishMs(samples);
  return finish > 0 ? samples[samples.length - 1][1] / finish : 0;
};

// Where the ghost is on a text `textLength` long. Its own run may have been
// shorter: past its last keystroke it keeps going at its average pace, so a
// longer text doesn't leave it parked halfway. It stops at the end.
export const ghostPositionOnText = (samples, ms, textLength) => {
  const finish = ghostFinishMs(samples);
  const position =
    ms <= finish
      ? ghostPositionAt(samples, ms)
      : samples[samples.length - 1][1] + (ms - finish) * ghostPace(samples);
  return Math.min(textLength, Math.floor(position));
};

// When the ghost reaches the end of a text `textLength` long
export const ghostFinishOnText = (samples, textLength) => {
  if (!samples.length) return 0;
  const hit = samples.find(([, length]) => length >= textLength);
  if (hit) return hit[0];
  const [lastMs, lastLength] = samples[samples.length - 1];
  const pace = ghostPace(samples);
  return pace > 0 ? Math.round(lastMs + (textLength - lastLength) / pace) : lastMs;
};

// Ahead (positive) or behind (negative) the ghost, in characters
export const ghostLead = (inputLength, ghostPosition) => inputLength - ghostPosition;

// The pacer: a ghost with no run behind it, just a steady speed. Where it
// is after `ms` of active typing at `wpm` (five characters to a word), and
// when it reaches the end of a text. No steps and no pauses -- evenness is
// the whole point of racing it.
const charsPerMs = (wpm) => (wpm * 5) / 60000;

export const pacerPositionOnText = (wpm, ms, textLength) =>
  Math.min(textLength, Math.floor(ms * charsPerMs(wpm)));

export const pacerFinishOnText = (wpm, textLength) =>
  wpm > 0 ? Math.round(textLength / charsPerMs(wpm)) : 0;

// "Auto" pace: a notch above your recent average in this mode, so it pulls
// you along without running away. Rounded to 5 so it reads as a target.
export const PACER_OPTIONS = [40, 50, 60, 70, 80, 90, 100];
const AUTO_PACER_FALLBACK = 40;
const AUTO_PACER_STEP_UP = 5;

export const autoPacerWpm = (recentWpms) => {
  if (!recentWpms.length) return AUTO_PACER_FALLBACK;
  const average = recentWpms.reduce((sum, wpm) => sum + wpm, 0) / recentWpms.length;
  return Math.max(20, Math.round((average + AUTO_PACER_STEP_UP) / 5) * 5);
};
