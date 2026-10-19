// How a "Ritmo" run is scored: every letter judged by how close to its
// beat it was typed, a combo that grows the multiplier, and the star mode
// that a long combo turns on. Pure: times come in, judgments come out, so
// the game loop only has to ask.

// How far off a press can be, in ms either way, for each grade
export const WINDOWS = { perfect: 45, good: 100, ok: 160 };

export const GRADES = ["perfect", "good", "early", "late", "miss"];

const POINTS = { perfect: 100, good: 70, early: 40, late: 40, miss: 0 };

// The multiplier climbs one step every this many in a row, up to MAX
export const COMBO_STEP = 10;
export const MAX_MULTIPLIER = 8;
// Every this many in a row lights the star mode, for this long: double
// points
export const STAR_COMBO = 50;
export const STAR_MS = 8000;

// The grade for a press `delta` ms off its note (negative: early), or null
// when it's too far to count as aimed at it
export const gradeFor = (delta) => {
  const off = Math.abs(delta);
  if (off <= WINDOWS.perfect) return "perfect";
  if (off <= WINDOWS.good) return "good";
  if (off <= WINDOWS.ok) return delta < 0 ? "early" : "late";
  return null;
};

// A held letter pays this much a ms it stays down, times the multiplier.
// Let go a touch early and it still counts as held all the way.
const HOLD_POINTS_PER_MS = 0.2;
export const HOLD_GRACE_MS = 100;

export const multiplierFor = (combo) =>
  Math.min(MAX_MULTIPLIER, 1 + Math.floor(combo / COMBO_STEP));

// A run over a chart's notes. press() and sweep() return what just
// happened, as judgments: { note, grade, delta, points, combo, multiplier,
// star, typed } -- `typed` the key pressed, when it wasn't the note's. A
// held letter's judgment also says `hold`: "holding", then "held" or
// "dropped". Its end comes from release() or sweep() as { kind: "hold",
// note, held, points }; letting go early only loses the rest of the bonus,
// not the combo.
export const createRun = (notes) => {
  const judged = new Map();
  let next = 0; // The first note not judged yet, so nothing scans from 0
  let combo = 0;
  let maxCombo = 0;
  let score = 0;
  let starUntil = -Infinity;
  let stars = 0;
  const counts = Object.fromEntries(GRADES.map((grade) => [grade, 0]));
  const deltas = [];
  const holding = new Map(); // note id -> its judgment, while held down
  const holds = {
    total: notes.filter((note) => note.hold > 0).length,
    held: 0,
    dropped: 0,
  };

  const finishHold = (judgment, at) => {
    const { note } = judgment;
    holding.delete(note.id);
    const end = note.time + note.hold;
    const held = at >= end - HOLD_GRACE_MS;
    const heldMs = held ? note.hold : Math.max(0, Math.min(note.hold, at - note.time));
    const star = Math.min(at, end) < starUntil;
    const points = Math.round(
      heldMs * HOLD_POINTS_PER_MS * multiplierFor(combo) * (star ? 2 : 1)
    );
    score += points;
    judgment.hold = held ? "held" : "dropped";
    judgment.holdPoints = points;
    holds[held ? "held" : "dropped"]++;
    return { kind: "hold", note, held, points };
  };

  const advance = () => {
    while (next < notes.length && judged.has(notes[next].id)) next++;
  };

  const judge = (note, grade, delta, at, typed) => {
    if (grade === "miss") {
      combo = 0;
    } else {
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      deltas.push(delta);
      if (combo % STAR_COMBO === 0) {
        starUntil = at + STAR_MS;
        stars++;
      }
    }
    const star = at < starUntil;
    const multiplier = multiplierFor(combo);
    const points = POINTS[grade] * multiplier * (star ? 2 : 1);
    score += points;
    counts[grade]++;
    const judgment = {
      note,
      grade,
      delta,
      points,
      combo,
      multiplier,
      star,
      ...(typed !== undefined && { typed }),
    };
    if (grade !== "miss" && note.hold > 0) {
      judgment.hold = "holding";
      holding.set(note.id, judgment);
    }
    judged.set(note.id, judgment);
    advance();
    return judgment;
  };

  // The notes still waiting whose window `at` falls in, earliest first
  const inReach = (at) => {
    const found = [];
    for (let i = next; i < notes.length; i++) {
      const note = notes[i];
      if (note.time - at > WINDOWS.ok) break;
      if (!judged.has(note.id) && Math.abs(at - note.time) <= WINDOWS.ok) {
        found.push(note);
      }
    }
    return found;
  };

  // A key pressed at `at` (ms on the chart's clock). Aimed at the nearest
  // note it can be: the right letter within reach scores, the wrong one
  // costs the earliest note there. With no note near, it's ignored.
  const press = (char, at) => {
    const near = inReach(at);
    if (!near.length) return null;
    const target = near.find((note) => note.char === char);
    if (target) {
      const delta = Math.round(at - target.time);
      return judge(target, gradeFor(delta), delta, at);
    }
    return judge(near[0], "miss", Math.round(at - near[0].time), at, char);
  };

  // A key let go at `at`: the held letters on it end there
  const release = (char, at) =>
    [...holding.values()]
      .filter((judgment) => judgment.note.char === char)
      .map((judgment) => finishHold(judgment, at));

  // Every key let go at once (the window lost focus)
  const releaseAll = (at) =>
    [...holding.values()].map((judgment) => finishHold(judgment, at));

  // Notes whose window has closed by `at` without a press: missed. And
  // held letters that made it to their end, still down: held.
  const sweep = (at) => {
    const missed = [];
    for (const judgment of [...holding.values()]) {
      const { note } = judgment;
      if (at >= note.time + note.hold)
        missed.push(finishHold(judgment, note.time + note.hold));
    }
    for (let i = next; i < notes.length; i++) {
      const note = notes[i];
      if (at - note.time <= WINDOWS.ok) break;
      if (!judged.has(note.id)) missed.push(judge(note, "miss", null, at));
    }
    return missed;
  };

  const state = (at = 0) => ({
    score,
    combo,
    maxCombo,
    multiplier: multiplierFor(combo),
    star: at < starUntil,
    starUntil,
    stars,
    judgedCount: judged.size,
    counts: { ...counts },
    holding: holding.size,
  });

  return {
    press,
    release,
    releaseAll,
    sweep,
    state,
    judgmentOf: (id) => judged.get(id) ?? null,
    get done() {
      return judged.size >= notes.length && holding.size === 0;
    },
    summary: () => summarizeRun({ notes, counts, deltas, score, maxCombo, stars, holds }),
  };
};

// What a finished run comes to. `accuracy` is the share of letters hit
// at all; `timing` weighs them by grade (a perfect counts whole, a good
// most of it). `offset` is the average press against its beat, positive
// when late; `spread` how far off they were on average, either way.
// `holds`: how many held letters there were, and how many made it.
export const summarizeRun = ({
  notes,
  counts,
  deltas,
  score,
  maxCombo,
  stars,
  holds = { total: 0, held: 0, dropped: 0 },
}) => {
  const total = notes.length;
  const hits = total - counts.miss;
  const weighted =
    counts.perfect + counts.good * 0.7 + (counts.early + counts.late) * 0.4;
  const mean = (values) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  return {
    total,
    hits,
    counts: { ...counts },
    score,
    maxCombo,
    stars,
    holds: { ...holds },
    accuracy: total ? Math.round((hits / total) * 1000) / 10 : 0,
    timing: total ? Math.round((weighted / total) * 1000) / 10 : 0,
    offset: Math.round(mean(deltas)),
    spread: Math.round(mean(deltas.map(Math.abs))),
    fullCombo: total > 0 && counts.miss === 0,
  };
};
