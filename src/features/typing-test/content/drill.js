// Builds practice text aimed at specific keys, for the training mode. Same
// contract as the other content banks -- a count in, a space-separated
// string out, never the same group twice in a row.
import { practiceWords, generateRandomWords } from "@/features/typing-test/content/words";

const VOWELS = [..."aeiou"];
// Consonants that pair cleanly with any vowel, so the made-up syllables stay
// pronounceable instead of turning into keyboard mash.
const CONSONANTS = [..."lsrtmnpcd"];

// Most of the text is real words, because typing prose is the actual skill;
// the rest is drilled syllables, which force the target key far more often
// than any Spanish text would.
const CLUSTER_SHARE = 0.3;

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const countOf = (word, key) =>
  [...word].reduce((sum, char) => sum + (char === key ? 1 : 0), 0);

// One pool per target, weighted so a word with three of that letter is
// three times as likely as one with a single one.
//
// Deliberately not one shared pool across every target: the "a" is in
// almost every Spanish word, so a shared pool would be nothing but a-words
// and the rare targets -- the ones actually worth drilling -- would barely
// show up at all.
const buildPool = (key) => {
  const pool = [];
  for (const word of practiceWords()) {
    for (let i = countOf(word, key); i > 0; i--) pool.push(word);
  }
  return pool;
};

// A fresh order for each pass through the targets: every one gets its turn
// within each cycle, without the text falling into an audible a-f-m-a-f-m.
const shuffled = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// A syllable built around the target. Consonants get vowels either side, and
// vowels get consonants, so "ñ" drills as "ñaño" rather than "ñtñs".
const buildCluster = (key) => {
  if (VOWELS.includes(key)) {
    return `${pick(CONSONANTS)}${key}${pick(CONSONANTS)}${key}`;
  }
  return `${key}${pick(VOWELS)}${key}${pick(VOWELS)}`;
};

// keys: the characters to drill. Anything that isn't a single letter is
// dropped -- a drill on the space bar or on a digit is a different exercise.
export const normalizeDrillKeys = (keys) => [
  ...new Set(
    (Array.isArray(keys) ? keys : [])
      .filter((key) => typeof key === "string" && /^\p{L}$/u.test(key))
      .map((key) => key.toLowerCase())
  ),
];

export const generateDrillText = (keys, count) => {
  const targets = normalizeDrillKeys(keys);
  // Nothing to aim at (a first-time typist, say) -- an ordinary word test is
  // a better use of the session than a drill on nothing.
  if (!targets.length) return generateRandomWords(count);

  const pools = new Map(targets.map((key) => [key, buildPool(key)]));
  const result = [];
  let last = null;
  let cycle = [];

  for (let i = 0; i < count; i++) {
    // Take targets a cycle at a time, so ten words across five keys means
    // two each rather than however the dice fell.
    if (!cycle.length) cycle = shuffled(targets);
    const key = cycle.pop();
    const pool = pools.get(key);

    let group;
    do {
      group =
        pool.length && Math.random() >= CLUSTER_SHARE ? pick(pool) : buildCluster(key);
    } while (group === last);
    result.push(group);
    last = group;
  }

  return result.join(" ");
};

// The drill on whole words instead of letters: the words you stumble on,
// each coming back a few times, shuffled so it's never the same run twice
// and never the same word twice in a row.
export const MAX_DRILL_WORDS = 10;

export const normalizeDrillWords = (words) =>
  [
    ...new Set(
      (Array.isArray(words) ? words : [])
        .filter((word) => typeof word === "string")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word && word.length <= 40 && !/\s/.test(word))
    ),
  ].slice(0, MAX_DRILL_WORDS);

export const generateWordDrillText = (words, count) => {
  const targets = normalizeDrillWords(words);
  if (!targets.length) return generateRandomWords(count);

  const result = [];
  let cycle = [];
  for (let i = 0; i < count; i++) {
    if (!cycle.length) cycle = shuffled(targets);
    let word = cycle.pop();
    // A fresh cycle can start with the word the last one ended on
    if (word === result[result.length - 1] && targets.length > 1) {
      cycle.unshift(word);
      word = cycle.pop();
    }
    result.push(word);
  }
  return result.join(" ");
};
