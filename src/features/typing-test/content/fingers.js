// Practice text for chosen fingers ("Dedos" mode): only the letters those
// fingers type on your keyboard. Real words that need nothing else come
// first -- with a whole hand there are plenty ("casa", "tres" on the left)
// -- and where there aren't enough (one finger alone), groups made of just
// its letters, the way a typing course drills "fgf rtr".
//
// Same contract as the other banks: a count in, a space-separated string
// out, never the same group twice in a row.
import { practiceWords, generateRandomWords } from "@/features/typing-test/content/words";
import {
  layoutRows,
  fingerOfKey,
  FINGERS,
} from "@/features/typing-test/utils/keyboardMap";
import { t } from "@/shared/i18n";

// The fingers that type letters, left to right as on the hands
export const FINGER_IDS = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
];

// The picks worth one button each
export const FINGER_PRESETS = {
  left: FINGER_IDS.slice(0, 4),
  right: FINGER_IDS.slice(4),
  both: [...FINGER_IDS],
  index: ["left-index", "right-index"],
  pinky: ["left-pinky", "right-pinky"],
};

export const DEFAULT_FINGERS = FINGER_PRESETS.index;

// Known fingers, once each, in hand order; an empty pick is no pick
export const normalizeFingers = (fingers) => {
  const chosen = new Set(Array.isArray(fingers) ? fingers : []);
  return FINGER_IDS.filter((id) => chosen.has(id));
};

// Which preset a pick is, if it's one of them
export const presetOf = (fingers) => {
  const pick = normalizeFingers(fingers).join();
  return (
    Object.keys(FINGER_PRESETS).find((id) => FINGER_PRESETS[id].join() === pick) ?? null
  );
};

// A pick in a few words: "Índices", "Meñique izquierdo", "3 dedos"
export const describeFingers = (fingers) => {
  const pick = normalizeFingers(fingers);
  const preset = presetOf(pick);
  if (preset) return t(`typing.fingerPicker.presets.${preset}`);
  if (pick.length === 1) {
    const name = FINGERS[pick[0]].name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return t("typing.fingerPicker.fingers", pick.length);
};

const VOWELS = new Set([..."aeiou"]);
const isLetter = (key) => /^\p{L}$/u.test(key);

// The letters the fingers type on this keyboard, in keyboard order
export const fingerKeys = (fingers, layout) => {
  const chosen = new Set(normalizeFingers(fingers));
  return layoutRows(layout)
    .flat()
    .filter((key) => isLetter(key) && chosen.has(fingerOfKey(key, layout)));
};

// Enough real words and they carry most of the text; a handful, some of
// it; none, and it's all letter groups
const wordShare = (words) => (words.length >= 12 ? 0.7 : words.length >= 4 ? 0.4 : 0);

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const shuffled = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// A group around one letter, from the chosen letters only. With vowels and
// consonants to hand, two syllables ("reta"); with one kind only, three to
// five letters of it ("fgvt").
const buildGroup = (key, keys) => {
  const vowels = keys.filter((k) => VOWELS.has(k));
  const consonants = keys.filter((k) => !VOWELS.has(k));
  if (vowels.length && consonants.length) {
    const first = VOWELS.has(key) ? `${pick(consonants)}${key}` : `${key}${pick(vowels)}`;
    return `${first}${pick(consonants)}${pick(vowels)}`;
  }
  const length = 3 + Math.floor(Math.random() * 3);
  const letters = [key];
  while (letters.length < length) letters.push(pick(keys));
  return shuffled(letters).join("");
};

// The words typed with these letters and nothing else, at least two long
export const wordsForKeys = (keys) => {
  const allowed = new Set(keys);
  return [
    ...new Set(
      practiceWords().filter(
        (word) => word.length >= 2 && [...word].every((char) => allowed.has(char))
      )
    ),
  ];
};

export const generateFingerText = (fingers, count, layout) => {
  const keys = fingerKeys(fingers, layout);
  if (!keys.length) return generateRandomWords(count);

  const words = wordsForKeys(keys);
  const share = wordShare(words);
  // Words by letter, so each letter's turn brings a word that has it
  const byKey = new Map(keys.map((key) => [key, words.filter((w) => w.includes(key))]));

  const result = [];
  let cycle = [];
  for (let i = 0; i < count; i++) {
    // Every letter gets its turn within each pass, like the drill
    if (!cycle.length) cycle = shuffled(keys);
    const key = cycle.pop();
    const pool = byKey.get(key).length ? byKey.get(key) : words;

    let group;
    let tries = 0;
    do {
      group = pool.length && Math.random() < share ? pick(pool) : buildGroup(key, keys);
      tries++;
    } while (group === result[result.length - 1] && tries < 10);
    result.push(group);
  }
  return result.join(" ");
};
