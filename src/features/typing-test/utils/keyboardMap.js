// Which physical key makes a character on a given keyboard (see
// keyboardLayouts.js), and what has to be held or pressed first: Shift,
// AltGr, or a dead key for an accent. Only what the on-screen keyboard
// draws -- characters it has no key for come back null rather than a guess.
import { layoutById } from "./keyboardLayouts";

// Stand in for the modifier keys on the drawn keyboard. Both Shift keys
// light up together.
export const SHIFT_KEY = "shift";
export const ALTGR_KEY = "altgr";

// Everything derived from a layout, worked out once per layout
const derived = new WeakMap();

// One column per finger, left to right from the 1/Q/A/Z column; index
// fingers take two columns each. Anything further out is a pinky's.
const COLUMN_FINGERS = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "left-index",
  "right-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
];

const fingerOfColumn = (column) =>
  column < 0 ? "left-pinky" : (COLUMN_FINGERS[column] ?? "right-pinky");

const derive = (layout) => {
  let result = derived.get(layout);
  if (result) return result;

  const fingers = new Map([
    [" ", "thumb"],
    [ALTGR_KEY, "thumb"],
  ]);
  const positions = new Map();
  layout.rows.forEach((row, rowIndex) => {
    row.keys.forEach((key, index) => {
      fingers.set(key, fingerOfColumn(row.start + index));
      positions.set(key, { row: rowIndex, column: row.start + index });
    });
  });

  result = { fingers, positions, keys: new Set(positions.keys()) };
  derived.set(layout, result);
  return result;
};

const resolveLayout = (layout) =>
  typeof layout === "string" || layout == null ? layoutById(layout) : layout;

// The keys a layout draws, in rows, for the drawn keyboard
export const layoutRows = (layout) => resolveLayout(layout).rows.map((row) => row.keys);

// Where a key sits: { row, column }, rows counted from the numbers down
export const keyPosition = (key, layout) =>
  derive(resolveLayout(layout)).positions.get(key) ?? null;

const plain = (key) => ({ key, shift: false, altgr: false, dead: null });

// A character straight off one key, maybe with Shift or AltGr
const direct = (char, layout, { keys }) => {
  if (keys.has(char)) return plain(char);
  if (layout.shift[char]) return { ...plain(layout.shift[char]), shift: true };
  if (layout.altgr[char]) return { ...plain(layout.altgr[char]), altgr: true };
  return null;
};

// { key, shift, altgr, dead } for one character, or null. `key` is what the
// keyboard labels: lowercase, unaccented, " " for the space bar. `dead` is
// the key pressed first for an accent, as { key, shift }.
export const keyboardTarget = (char, layout) => {
  if (typeof char !== "string" || [...char].length !== 1) return null;
  if (char === " ") return plain(" ");
  layout = resolveLayout(layout);
  const info = derive(layout);

  const found = direct(char, layout, info);
  if (found) return found;

  // A capital: its lowercase letter's key, plus Shift
  const lower = char.toLowerCase();
  const upper = lower !== char;
  if (upper) {
    const base = direct(lower, layout, info);
    if (base && !base.shift) return { ...base, shift: true };
  }

  // An accented letter: the plain letter, after the accent's dead key
  const [letter, ...marks] = lower.normalize("NFD");
  const dead = marks.length === 1 ? layout.dead[marks[0]] : null;
  if (dead) {
    const base = direct(letter, layout, info);
    if (base && !base.shift && !base.altgr) return { ...base, shift: upper, dead };
  }
  return null;
};

// Per-key counters (keyed by the character the text asked for) folded onto
// the keys that make them: "A", "a" and "á" all land on the A.
export const foldByKey = (counts, layout) => {
  const folded = {};
  for (const [char, count] of Object.entries(counts ?? {})) {
    const target = keyboardTarget(char, layout);
    if (target) folded[target.key] = (folded[target.key] || 0) + count;
  }
  return folded;
};

// Standard touch typing: which finger each key belongs to. Fingers of a
// kind share a color on both hands, so "the same finger on the other hand"
// shows at a glance.
export const FINGERS = {
  "left-pinky": { name: "meñique izquierdo", kind: "pinky", hand: "left" },
  "left-ring": { name: "anular izquierdo", kind: "ring", hand: "left" },
  "left-middle": { name: "medio izquierdo", kind: "middle", hand: "left" },
  "left-index": { name: "índice izquierdo", kind: "index", hand: "left" },
  "right-index": { name: "índice derecho", kind: "index", hand: "right" },
  "right-middle": { name: "medio derecho", kind: "middle", hand: "right" },
  "right-ring": { name: "anular derecho", kind: "ring", hand: "right" },
  "right-pinky": { name: "meñique derecho", kind: "pinky", hand: "right" },
  thumb: { name: "pulgar", kind: "thumb", hand: null },
};

// The finger for a key on the drawn keyboard (Shift is either pinky, so
// it has none of its own), or for any character, through the key that
// makes it
export const fingerOfKey = (key, layout) =>
  derive(resolveLayout(layout)).fingers.get(key) ?? null;
export const fingerOfChar = (char, layout) => {
  const target = keyboardTarget(char, layout);
  return target ? fingerOfKey(target.key, layout) : null;
};
