import { isCurrentMetrics } from "./historyStats";

// When in the day you type best. Raw wpm would mostly measure which modes
// you play when -- code at night reads as "slow at night" -- so every
// session is taken relative to your own average in its mode, and each part
// of the day gets the average of those.

export const DAY_PARTS = [
  { id: "dawn", label: "madrugada", from: 0, to: 6 },
  { id: "morning", label: "mañana", from: 6, to: 12 },
  { id: "afternoon", label: "tarde", from: 12, to: 19 },
  { id: "night", label: "noche", from: 19, to: 24 },
];

// A part of the day needs this many sessions before it says anything...
export const MIN_PART_SESSIONS = 5;
// ...and the best one has to beat your average by this much to be news
export const MIN_GAP = 0.05;

const partOf = (isoDate) => {
  const hour = new Date(isoDate).getHours();
  return DAY_PARTS.find((part) => hour >= part.from && hour < part.to);
};

export const computeTimeOfDay = (results) => {
  const comparable = results.filter((r) => isCurrentMetrics(r) && r.wpm > 0);

  const byMode = new Map();
  for (const result of comparable) {
    const mode = byMode.get(result.mode) ?? { total: 0, count: 0 };
    mode.total += result.wpm;
    mode.count++;
    byMode.set(result.mode, mode);
  }

  const parts = DAY_PARTS.map((part) => ({ ...part, sessions: 0, relativeTotal: 0 }));
  for (const result of comparable) {
    const mode = byMode.get(result.mode);
    // A mode played once is its own average: it can't be better or worse
    // than itself, so it would only water the others down
    if (mode.count < 2) continue;
    const part = parts.find((p) => p.id === partOf(result.date).id);
    part.sessions++;
    part.relativeTotal += result.wpm / (mode.total / mode.count);
  }

  const measured = parts
    .map(({ relativeTotal, ...part }) => ({
      ...part,
      // 1.12 = 12% faster than your usual in those modes
      relative: part.sessions ? relativeTotal / part.sessions : null,
    }))
    .map((part) => ({ ...part, enough: part.sessions >= MIN_PART_SESSIONS }));

  const ranked = measured.filter((part) => part.enough);
  if (ranked.length < 2) return { enoughData: false, parts: measured, best: null };

  const best = ranked.reduce((top, part) => (part.relative > top.relative ? part : top));
  const worst = ranked.reduce((low, part) => (part.relative < low.relative ? part : low));
  return {
    enoughData: true,
    parts: measured,
    best: best.relative - 1 >= MIN_GAP ? best : null,
    worst: 1 - worst.relative >= MIN_GAP ? worst : null,
  };
};
