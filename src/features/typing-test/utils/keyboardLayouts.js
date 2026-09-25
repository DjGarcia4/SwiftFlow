import { t } from "@/shared/i18n";

// The keyboards SwiftFlow can draw and reason about. Each one is what's
// printed on its keys (lowercase, left to right), what Shift and AltGr make
// on them, and its dead keys: the ones pressed before a letter to put an
// accent on it. Only the four rows of typing keys -- the key left of the 1
// and everything past the letters' right edge beyond them is left out.
//
// `start` is the column of a row's first key, counted from the 1/Q/A/Z
// column, so fingers can be told apart the same way on every layout: ISO
// keyboards have an extra key (<) left of the Z.

// Combining marks, as String.prototype.normalize("NFD") splits them off:
// "á" is "a" followed by ACUTE.
export const ACUTE = "́";
export const DIAERESIS = "̈";
export const TILDE = "̃";
export const GRAVE = "̀";
export const CIRCUMFLEX = "̂";

const row = (keys, start = 0) => ({ keys: [...keys], start });

// What Shift makes on each key of a row, paired up in order. A space in
// `shifted` means that key has nothing worth listing.
const pairs = (keys, shifted) =>
  Object.fromEntries(
    [...shifted]
      .map((char, index) => [char, [...keys][index]])
      .filter(([char]) => char !== " ")
  );

const LATAM = {
  id: "latam",
  get name() {
    return t("typing.keyboard.layouts.latam");
  },
  rows: [
    row("1234567890'¿"),
    row("qwertyuiop´+"),
    row("asdfghjklñ{}"),
    row("<zxcvbnm,.-", -1),
  ],
  shift: {
    ...pairs("1234567890'¿", '!"#$%&/()=?¡'),
    ...pairs("+", "*"),
    ...pairs("{}", "[]"),
    ...pairs("<,.-", ">;:_"),
  },
  altgr: { "@": "q", "\\": "'", "~": "+", "^": "{", "`": "}" },
  dead: {
    [ACUTE]: { key: "´", shift: false },
    [DIAERESIS]: { key: "´", shift: true },
  },
};

const SPAIN = {
  id: "es",
  get name() {
    return t("typing.keyboard.layouts.es");
  },
  rows: [
    row("1234567890'¡"),
    row("qwertyuiop`+"),
    row("asdfghjklñ´ç"),
    row("<zxcvbnm,.-", -1),
  ],
  shift: {
    ...pairs("1234567890'¡", '!"·$%&/()=?¿'),
    ...pairs("+", "*"),
    ...pairs("<,.-", ">;:_"),
  },
  altgr: {
    "|": "1",
    "@": "2",
    "#": "3",
    "~": "4",
    "€": "e",
    "[": "`",
    "]": "+",
    "{": "´",
    "}": "ç",
  },
  dead: {
    [ACUTE]: { key: "´", shift: false },
    [DIAERESIS]: { key: "´", shift: true },
    [GRAVE]: { key: "`", shift: false },
    [CIRCUMFLEX]: { key: "`", shift: true },
  },
};

// US-International: the US keyboard with the quote as a dead acute, and
// AltGr for the Spanish letters it has no key for
const US = {
  id: "us",
  get name() {
    return t("typing.keyboard.layouts.us");
  },
  rows: [row("1234567890-="), row("qwertyuiop[]"), row("asdfghjkl;'"), row("zxcvbnm,./")],
  shift: {
    ...pairs("1234567890-=", "!@#$%^&*()_+"),
    ...pairs("[]", "{}"),
    ...pairs(";'", ':"'),
    ...pairs(",./", "<>?"),
  },
  altgr: { ñ: "n", "¡": "1", "¿": "/" },
  dead: {
    [ACUTE]: { key: "'", shift: false },
    [DIAERESIS]: { key: "'", shift: true },
  },
};

// Dvorak and Colemak are drawn on their US base: their ways of making
// accents vary from one system to the next, so none is guessed at
const DVORAK = {
  id: "dvorak",
  get name() {
    return t("typing.keyboard.layouts.dvorak");
  },
  rows: [row("1234567890[]"), row("',.pyfgcrl/="), row("aoeuidhtns-"), row(";qjkxbmwvz")],
  shift: {
    ...pairs("1234567890[]", "!@#$%^&*(){}"),
    ...pairs("',./=", '"<>?+'),
    ...pairs("-", "_"),
    ...pairs(";", ":"),
  },
  altgr: {},
  dead: {},
  get note() {
    return t("typing.keyboard.noAccentsNote");
  },
};

const COLEMAK = {
  id: "colemak",
  get name() {
    return t("typing.keyboard.layouts.colemak");
  },
  rows: [row("1234567890-="), row("qwfpgjluy;[]"), row("arstdhneio'"), row("zxcvbkm,./")],
  shift: {
    ...pairs("1234567890-=", "!@#$%^&*()_+"),
    ...pairs(";[]", ":{}"),
    ...pairs("'", '"'),
    ...pairs(",./", "<>?"),
  },
  altgr: {},
  dead: {},
  get note() {
    return t("typing.keyboard.noAccentsNote");
  },
};

export const KEYBOARD_LAYOUTS = [LATAM, SPAIN, US, DVORAK, COLEMAK];

export const DEFAULT_LAYOUT_ID = LATAM.id;

const BY_ID = new Map(KEYBOARD_LAYOUTS.map((layout) => [layout.id, layout]));

export const isLayoutId = (id) => BY_ID.has(id);

export const layoutById = (id) => BY_ID.get(id) ?? LATAM;

// A first guess from the browser's language, until one is picked: Spain's
// keyboard for Spain, the US one for English, and the Latin American one
// for everyone else, which is most people writing in Spanish.
export const guessLayoutId = (languages = []) => {
  const first = languages.find(Boolean)?.toLowerCase() ?? "";
  if (first === "es-es" || first === "ca" || first.startsWith("ca-")) return SPAIN.id;
  if (first.startsWith("en")) return US.id;
  return LATAM.id;
};
