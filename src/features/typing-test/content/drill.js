// Builds practice text aimed at specific keys, for the training mode. Same
// contract as the other content banks -- a count in, a space-separated
// string out, never the same group twice in a row.
import { spanishWords, generateRandomWords } from "@/features/typing-test/content/words";

const VOWELS = [..."aeiou"];
// Consonants that pair cleanly with any vowel, so the made-up syllables stay
// pronounceable instead of turning into keyboard mash.
const CONSONANTS = [..."lsrtmnpcd"];

// Most of the text is real words, because typing prose is the actual skill;
// the rest is drilled syllables, which force the target key far more often
// than any Spanish text would.
const CLUSTER_SHARE = 0.3;

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const countTargets = (word, targets) =>
  [...word].reduce((sum, char) => sum + (targets.has(char) ? 1 : 0), 0);

// Weighted so a word with three target letters is three times as likely as
// one with a single letter: more repetitions of the thing being practiced
// per word typed.
const buildWeightedPool = (targets) => {
  const pool = [];
  for (const word of spanishWords) {
    const hits = countTargets(word, targets);
    for (let i = 0; i < hits; i++) pool.push(word);
  }
  return pool;
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

  const targetSet = new Set(targets);
  const pool = buildWeightedPool(targetSet);
  const result = [];
  let last = null;

  for (let i = 0; i < count; i++) {
    let group;
    do {
      group =
        pool.length && Math.random() >= CLUSTER_SHARE
          ? pick(pool)
          : buildCluster(pick(targets));
    } while (group === last);
    result.push(group);
    last = group;
  }

  return result.join(" ");
};
