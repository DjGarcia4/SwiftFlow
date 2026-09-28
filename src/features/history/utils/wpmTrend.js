// What the WPM trend chart says in words: session speeds jump around from
// one run to the next, so the line worth reading is a running average, and
// the verdict compares your latest runs against the ones just before.

// How many runs each point of the average line takes in
export const TREND_WINDOW = 5;

// Up to how many runs each side of the comparison takes
const COMPARE_MAX = 10;
// Below this many wpm of difference it's the same speed, not a trend
const STEADY_WITHIN = 2;

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

// The average of each run and the ones just before it (fewer at the start,
// where there aren't that many yet), oldest first like the values
export const movingAverage = (values, window = TREND_WINDOW) =>
  values.map((_, index) =>
    mean(values.slice(Math.max(0, index - window + 1), index + 1))
  );

// { recent, before, change, count, direction } for values oldest first, or
// null with too few runs to compare. `count` is how many runs each side
// took; direction is "up", "down" or "steady".
export const summarizeTrend = (values) => {
  const count = Math.min(COMPARE_MAX, Math.floor(values.length / 2));
  if (count < 2) return null;
  const recent = Math.round(mean(values.slice(-count)));
  const before = Math.round(mean(values.slice(-2 * count, -count)));
  const change = recent - before;
  return {
    recent,
    before,
    change,
    count,
    direction: Math.abs(change) < STEADY_WITHIN ? "steady" : change > 0 ? "up" : "down",
  };
};

// The fastest run's position (the last one, if it's tied)
export const bestIndex = (values) =>
  values.reduce(
    (best, value, index) => (best === -1 || value >= values[best] ? index : best),
    -1
  );
