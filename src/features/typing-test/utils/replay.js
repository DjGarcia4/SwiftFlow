// "Where did I slow down": the typed text split into words, each with how
// long it took, from the run's timeline (progressSamples: [activeMs,
// inputLength] per change). Speed is compared per character against the
// run's own middle pace, so a long word isn't slow just for being long.

// A word's time runs from the moment the one before it was finished --
// its separator typed -- to the moment its own last character first went
// in. The first word has no "before", so its time starts at the first key.
const firstReach = (samples, length) => {
  for (const [ms, reached] of samples) {
    if (reached >= length) return ms;
  }
  return null;
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// How a word's pace compares with the run's middle one, per character
const TIERS = [
  { id: "fast", upTo: 0.8 },
  { id: "normal", upTo: 1.25 },
  { id: "slow", upTo: 1.7 },
  { id: "stuck", upTo: Infinity },
];
const tierFor = (ratio) => TIERS.find((tier) => ratio <= tier.upTo).id;

// text: the reference text. input: what was typed. samples: the timeline.
// Returns segments covering the typed part of the text, in order: words
// ({ type: "word", text, ms, wpm, tier, hadError }) and the separators
// between them ({ type: "gap", text }), plus the slowest words.
export const computeReplay = ({ text, input, samples }) => {
  const typed = text.slice(0, input.length);
  const segments = [];
  const pattern = /(\s+)|(\S+)/g;
  let match;
  while ((match = pattern.exec(typed))) {
    const start = match.index;
    const end = start + match[0].length;
    if (match[1]) {
      segments.push({ type: "gap", text: match[0] });
      continue;
    }
    const from = start === 0 ? (samples[0]?.[0] ?? 0) : firstReach(samples, start);
    const to = firstReach(samples, end);
    const ms = from === null || to === null ? null : Math.max(0, to - from);
    segments.push({
      type: "word",
      text: match[0],
      start,
      ms,
      msPerChar: ms === null ? null : ms / match[0].length,
      wpm: ms ? Math.round(match[0].length / 5 / (ms / 60000)) : null,
      // Wrong in what was left typed, not counting fixes along the way
      hadError: [...match[0]].some((char, i) => input[start + i] !== char),
    });
  }

  const words = segments.filter((s) => s.type === "word" && s.msPerChar !== null);
  // The first word carries the time to find the keyboard, so it doesn't
  // set the pace for the rest
  const paced = words.filter((word) => word.start > 0);
  const middle = paced.length ? median(paced.map((w) => w.msPerChar)) : null;

  for (const word of words) {
    word.tier = middle ? tierFor(word.msPerChar / middle) : "normal";
  }

  const slowest = [...paced]
    .filter((word) => word.tier === "slow" || word.tier === "stuck")
    .sort((a, b) => b.msPerChar - a.msPerChar)
    .slice(0, 5);

  return { segments, slowest };
};
