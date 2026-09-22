// A "perfect round": a finished session without a single wrong keystroke,
// not even one fixed with backspace. Counted per kind of session (the same
// mode + value pairs the personal bests use), so "15s" and "Código · Go"
// each keep their own tally.

// Short enough to be over before a mistake could happen isn't an
// achievement -- a zen session ended after five letters, say.
export const MIN_PERFECT_KEYSTROKES = 20;

export const isPerfectRound = (result) => {
  // Sessions from before per-keystroke tracking only know their final
  // accuracy, which rounds 99.6% up to 100 -- so they also need zero errors
  // left in the text to count.
  if (!Number.isFinite(result.errorKeystrokes)) {
    return result.accuracy === 100 && !result.errors;
  }
  return result.errorKeystrokes === 0 && result.keystrokes >= MIN_PERFECT_KEYSTROKES;
};

export const perfectRoundKey = ({ mode, modeValue }) => `${mode}:${modeValue ?? ""}`;

// { [key]: { mode, modeValue, count } } from a list of results.
export const tallyPerfectRounds = (results) => {
  const tally = {};
  for (const result of results) {
    if (!isPerfectRound(result)) continue;
    const key = perfectRoundKey(result);
    tally[key] ??= { mode: result.mode, modeValue: result.modeValue ?? null, count: 0 };
    tally[key].count++;
  }
  return tally;
};

// Per kind, whichever of the two knows about more. The stored tally
// outlives the history's size cap, while an imported history can know about
// rounds this device never saw -- neither alone is the whole story.
export const mergePerfectTallies = (a, b) => {
  const merged = { ...a };
  for (const [key, entry] of Object.entries(b)) {
    if (!merged[key] || entry.count > merged[key].count) merged[key] = { ...entry };
  }
  return merged;
};
