// Pure helpers over a list of history results (most-recent-first), kept
// separate from the store so they're trivial to unit test.

export const computeBestWpm = (results) => {
  if (!results.length) return 0;
  return Math.max(...results.map((r) => r.wpm));
};

export const computeAverageWpm = (results) => {
  if (!results.length) return 0;
  const total = results.reduce((sum, r) => sum + r.wpm, 0);
  return Math.round(total / results.length);
};

export const computeAverageAccuracy = (results) => {
  if (!results.length) return 0;
  const total = results.reduce((sum, r) => sum + r.accuracy, 0);
  return Math.round(total / results.length);
};

const MODE_LABELS = {
  time: (value) => `${value}s`,
  words: (value) => `${value} palabras`,
  code: (value) => (value ? `Código · ${value}` : "Código"),
  quote: () => "Cita",
  zen: () => "Zen",
};

export const formatModeLabel = ({ mode, modeValue }) => {
  const format = MODE_LABELS[mode];
  return format ? format(modeValue) : mode;
};
