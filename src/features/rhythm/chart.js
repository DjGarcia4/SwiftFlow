// The sheet music of a "Ritmo" run: which letter lands when. Words from the
// language being practiced are laid on the track's grid one letter per
// step, with a rest between words, each word starting on a beat so it
// sounds like a phrase and not a stream of letters.

import { trackTimeline } from "./tracks";

// steps: letters per beat (1 = on the beat, 2 = eighths, 4 = sixteenths)
// gap: the rest after a word, in steps
// holds: how often a word's last letter is held down through the rest
// approachMs: how long a letter is on screen before it lands
export const DIFFICULTIES = {
  easy: { steps: 1, gap: 2, holds: 0.3, minLength: 2, maxLength: 5, approachMs: 2200 },
  normal: { steps: 1, gap: 1, holds: 0.3, minLength: 3, maxLength: 7, approachMs: 1900 },
  hard: { steps: 2, gap: 2, holds: 0.35, minLength: 3, maxLength: 9, approachMs: 1600 },
  expert: { steps: 2, gap: 1, holds: 0.4, minLength: 4, maxLength: 12, approachMs: 1350 },
};

// A held letter lasts at least this much of a beat, or it isn't one: too
// short to feel the difference from a tap
const MIN_HOLD_BEATS = 0.5;

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES);

export const isDifficultyId = (id) => DIFFICULTY_IDS.includes(id);

// Expert on a slow song goes to sixteenths: eighths at 84 bpm would be
// slower than Hard on a fast one
export const stepsPerBeat = (difficulty, bpm) => {
  const { steps } = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  return difficulty === "expert" && bpm < 110 ? 4 : steps;
};

// The words that fit this difficulty and can be typed one key each: no
// Shift, no dead key, nothing the keyboard can't make. Lowercased, without
// repeats.
export const playableWords = (bank, difficulty, canType) => {
  const { minLength, maxLength } = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  const seen = new Set();
  const words = [];
  for (const raw of bank) {
    const word = String(raw).toLowerCase();
    const length = [...word].length;
    if (length < minLength || length > maxLength || seen.has(word)) continue;
    if (![...word].every((char) => /\p{L}/u.test(char) && canType(char))) continue;
    seen.add(word);
    words.push(word);
  }
  return words;
};

// { notes, words }: each note { id, time, char, word, index, hold? },
// `time` in ms from the track's first beat, `hold` how long a held letter
// stays down (only on those), `word` the word it belongs to and
// `index` its place in it. Each word { text, first }, `first` its first
// note. `random` is a Math.random stand-in, so a seed gives the same chart.
export const buildChart = ({
  track,
  difficulty,
  bank,
  canType = () => true,
  random = Math.random,
}) => {
  const words = playableWords(bank, difficulty, canType);
  const notes = [];
  const placed = [];
  if (!words.length) return { notes, words: placed };

  const { beatMs, firstBeat, playBeats } = trackTimeline(track);
  const steps = stepsPerBeat(difficulty, track.bpm);
  const { gap, holds } = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  const stepMs = beatMs / steps;
  const startMs = firstBeat * beatMs;
  const lastStep = playBeats * steps;

  let step = 0;
  let previous = null;
  // A word that doesn't fit the room left is skipped for a shorter one; a
  // few tries and the song's over
  let misses = 0;
  while (step < lastStep && misses < 12) {
    const word = words[Math.floor(random() * words.length)];
    if (word === previous && words.length > 1) continue;
    const letters = [...word];
    if (step + letters.length > lastStep) {
      misses++;
      continue;
    }
    const wordIndex = placed.length;
    placed.push({ text: word, first: notes.length });
    letters.forEach((char, index) => {
      notes.push({
        id: notes.length,
        time: Math.round(startMs + (step + index) * stepMs),
        char,
        word: wordIndex,
        index,
      });
    });
    previous = word;
    // The rest, then on to the next beat
    const lastLetter = step + letters.length - 1;
    step += letters.length + gap;
    step = Math.ceil(step / steps) * steps;
    // Sometimes the last letter rings on through the rest, let go a step
    // before the next word comes in
    const holdSteps = Math.min(step, lastStep) - lastLetter - 1;
    if (holdSteps * stepMs >= MIN_HOLD_BEATS * beatMs && random() < holds) {
      notes[notes.length - 1].hold = Math.round(holdSteps * stepMs);
    }
  }

  return { notes, words: placed };
};
