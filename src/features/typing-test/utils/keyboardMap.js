// Which physical key makes a character on a Spanish keyboard, and what has
// to be held or pressed first: Shift for capitals and the upper symbols, the
// dead accent key for á/é/í/ó/ú. Only what the on-screen keyboard draws --
// characters it has no key for come back null rather than a guess.

export const KEYBOARD_ROWS = [
  [..."1234567890"],
  [..."qwertyuiop"],
  [..."asdfghjklñ"],
  [..."zxcvbnm,.-"],
];

// The dead accent key. Spain and Latin America put it in different spots
// near the Ñ, so it's drawn right after it -- close enough for either.
export const ACCENT_KEY = "´";

// Stands in for either Shift key on the drawn keyboard; both light up
// together.
export const SHIFT_KEY = "shift";

const ACCENTED = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u" };

// Shift + a key on the number and bottom rows
const SHIFTED = {
  "!": "1",
  '"': "2",
  "·": "3",
  $: "4",
  "%": "5",
  "&": "6",
  "/": "7",
  "(": "8",
  ")": "9",
  "=": "0",
  ";": ",",
  ":": ".",
  _: "-",
};

const ON_KEYBOARD = new Set(KEYBOARD_ROWS.flat());

// { key, shift, accent } for one character, or null. `key` is what the
// keyboard labels: lowercase, unaccented, " " for the space bar.
export const keyboardTarget = (char) => {
  if (typeof char !== "string" || [...char].length !== 1) return null;
  if (char === " ") return { key: " ", shift: false, accent: false };

  const lower = char.toLowerCase();
  const shift = char !== lower;
  const unaccented = ACCENTED[lower];
  if (unaccented) return { key: unaccented, shift, accent: true };
  if (ON_KEYBOARD.has(lower)) return { key: lower, shift, accent: false };
  if (SHIFTED[char]) return { key: SHIFTED[char], shift: true, accent: false };
  return null;
};

// Per-key counters (keyed by the character the text asked for) folded onto
// the keys that make them: "A", "a" and "á" all land on the A.
export const foldByKey = (counts) => {
  const folded = {};
  for (const [char, count] of Object.entries(counts ?? {})) {
    const target = keyboardTarget(char);
    if (target) folded[target.key] = (folded[target.key] || 0) + count;
  }
  return folded;
};
