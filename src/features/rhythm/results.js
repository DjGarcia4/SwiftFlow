// A "Ritmo" run as the history keeps it: a result like any other mode's
// (wpm, accuracy, the keys asked for and missed) so the stats, the streak
// and the key heatmap count it, plus what only rhythm has under `rhythm`.
import { trackTimeline } from "./tracks";

// summary: from judge.js. keyStats: { attempts, missed, confusions }, by
// the character the chart asked for.
export const rhythmResult = ({
  summary,
  notes,
  track,
  difficulty,
  keyStats = {},
  textLanguage,
}) => {
  const { beatMs, durationMs } = trackTimeline(track);
  // The wpm of the song itself: the letters hit over the stretch they
  // were spread across
  const minutes = notes.length ? (notes.at(-1).time - notes[0].time + beatMs) / 60000 : 0;
  const perMinute = (letters) => (minutes > 0 ? Math.round(letters / 5 / minutes) : 0);
  return {
    mode: "rhythm",
    modeValue: track.id,
    wpm: perMinute(summary.hits),
    rawWpm: perMinute(summary.total),
    accuracy: Math.round(summary.accuracy),
    errors: summary.counts.miss,
    timeElapsed: Math.round(durationMs / 1000),
    ...(textLanguage && { textLanguage }),
    maxStreak: summary.maxCombo,
    keystrokes: summary.total,
    errorKeystrokes: summary.counts.miss,
    keyAttempts: { ...keyStats.attempts },
    missedKeys: { ...keyStats.missed },
    confusions: { ...keyStats.confusions },
    rhythm: {
      difficulty,
      score: summary.score,
      counts: { ...summary.counts },
      timing: summary.timing,
      offset: summary.offset,
      spread: summary.spread,
      stars: summary.stars,
      ...(summary.holds?.total > 0 && { holds: { ...summary.holds } }),
      fullCombo: summary.fullCombo,
    },
  };
};

// The best score on a track at a difficulty, or 0
export const bestRhythmScore = (results, trackId, difficulty) =>
  results.reduce(
    (best, result) =>
      result.mode === "rhythm" &&
      result.modeValue === trackId &&
      result.rhythm?.difficulty === difficulty
        ? Math.max(best, result.rhythm.score || 0)
        : best,
    0
  );

// A letter for the run, as rhythm games give: S for a flawless one on the
// beat, then A to D by how close to the beat it was
export const RANKS = ["S", "A", "B", "C", "D"];

export const rhythmRank = ({ timing, fullCombo }) => {
  if (fullCombo && timing >= 95) return "S";
  if (timing >= 90) return "A";
  if (timing >= 80) return "B";
  if (timing >= 65) return "C";
  return "D";
};
