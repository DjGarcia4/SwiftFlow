import { describe, it, expect } from "vitest";
import {
  keyboardTarget,
  foldByKey,
  fingerOfKey,
  fingerOfChar,
  keyPosition,
} from "./keyboardMap";
import {
  KEYBOARD_LAYOUTS,
  layoutById,
  guessLayoutId,
  DEFAULT_LAYOUT_ID,
} from "./keyboardLayouts";

const key = (key, extra = {}) => ({
  key,
  shift: false,
  altgr: false,
  dead: null,
  ...extra,
});

describe("keyboardTarget", () => {
  it("maps plain letters, digits and the space bar", () => {
    expect(keyboardTarget("a", "latam")).toEqual(key("a"));
    expect(keyboardTarget("ñ", "latam")).toEqual(key("ñ"));
    expect(keyboardTarget("7", "latam")).toEqual(key("7"));
    expect(keyboardTarget(" ", "latam")).toEqual(key(" "));
  });

  it("asks for Shift on capitals", () => {
    expect(keyboardTarget("Ñ", "latam")).toEqual(key("ñ", { shift: true }));
  });

  it("puts the dead accent key first on accented vowels", () => {
    const acute = { key: "´", shift: false };
    expect(keyboardTarget("é", "latam")).toEqual(key("e", { dead: acute }));
    expect(keyboardTarget("Á", "es")).toEqual(key("a", { shift: true, dead: acute }));
    expect(keyboardTarget("ü", "es")).toEqual(
      key("u", { dead: { key: "´", shift: true } })
    );
  });

  it("finds the upper symbols under Shift, where each layout puts them", () => {
    expect(keyboardTarget(":", "latam")).toEqual(key(".", { shift: true }));
    expect(keyboardTarget("(", "latam")).toEqual(key("8", { shift: true }));
    expect(keyboardTarget("(", "us")).toEqual(key("9", { shift: true }));
    expect(keyboardTarget("#", "latam")).toEqual(key("3", { shift: true }));
    expect(keyboardTarget("·", "es")).toEqual(key("3", { shift: true }));
  });

  it("knows where each keyboard keeps the Spanish question marks", () => {
    expect(keyboardTarget("¿", "latam")).toEqual(key("¿"));
    expect(keyboardTarget("¡", "latam")).toEqual(key("¿", { shift: true }));
    expect(keyboardTarget("¡", "es")).toEqual(key("¡"));
    expect(keyboardTarget("¿", "es")).toEqual(key("¡", { shift: true }));
    expect(keyboardTarget("¿", "us")).toEqual(key("/", { altgr: true }));
  });

  it("reaches AltGr symbols", () => {
    expect(keyboardTarget("@", "latam")).toEqual(key("q", { altgr: true }));
    expect(keyboardTarget("@", "es")).toEqual(key("2", { altgr: true }));
    expect(keyboardTarget("@", "us")).toEqual(key("2", { shift: true }));
    expect(keyboardTarget("{", "latam")).toEqual(key("{"));
    expect(keyboardTarget("{", "es")).toEqual(key("´", { altgr: true }));
  });

  it("types Spanish on the US-International keyboard", () => {
    expect(keyboardTarget("á", "us")).toEqual(
      key("a", { dead: { key: "'", shift: false } })
    );
    expect(keyboardTarget("ñ", "us")).toEqual(key("n", { altgr: true }));
    expect(keyboardTarget("Ñ", "us")).toEqual(key("n", { altgr: true, shift: true }));
  });

  it("puts the letters where Dvorak and Colemak have them", () => {
    expect(keyboardTarget("o", "dvorak")).toEqual(key("o"));
    expect(keyboardTarget("?", "dvorak")).toEqual(key("/", { shift: true }));
    expect(keyboardTarget("S", "colemak")).toEqual(key("s", { shift: true }));
  });

  it("gives up on what the drawn keyboard has no key for", () => {
    expect(keyboardTarget("é", "dvorak")).toBeNull();
    expect(keyboardTarget("ñ", "colemak")).toBeNull();
    expect(keyboardTarget("\n", "latam")).toBeNull();
    expect(keyboardTarget("", "latam")).toBeNull();
    expect(keyboardTarget("ab", "latam")).toBeNull();
  });

  it("falls back to the default keyboard for an unknown one", () => {
    expect(keyboardTarget("¿", "nope")).toEqual(keyboardTarget("¿", DEFAULT_LAYOUT_ID));
    expect(keyboardTarget("¿")).toEqual(keyboardTarget("¿", DEFAULT_LAYOUT_ID));
  });
});

describe("foldByKey", () => {
  it("adds every character up on the key that makes it", () => {
    expect(foldByKey({ a: 3, A: 1, á: 2, "¿": 5, ":": 1, "\n": 4 }, "latam")).toEqual({
      a: 6,
      "¿": 5,
      ".": 1,
    });
  });
});

describe("fingers", () => {
  it("follows standard touch typing", () => {
    expect(fingerOfKey("a", "latam")).toBe("left-pinky");
    expect(fingerOfKey("f", "latam")).toBe("left-index");
    expect(fingerOfKey("g", "latam")).toBe("left-index");
    expect(fingerOfKey("h", "latam")).toBe("right-index");
    expect(fingerOfKey("ñ", "latam")).toBe("right-pinky");
    expect(fingerOfKey(",", "latam")).toBe("right-middle");
    expect(fingerOfKey("5", "latam")).toBe("left-index");
    expect(fingerOfKey(" ", "latam")).toBe("thumb");
  });

  it("gives the keys past the edges to the pinkies", () => {
    expect(fingerOfKey("<", "latam")).toBe("left-pinky");
    expect(fingerOfKey("}", "latam")).toBe("right-pinky");
    expect(fingerOfKey("´", "es")).toBe("right-pinky");
  });

  it("follows each layout's own letters", () => {
    expect(fingerOfKey("o", "dvorak")).toBe("left-ring");
    expect(fingerOfKey("r", "colemak")).toBe("left-ring");
    expect(fingerOfKey("s", "colemak")).toBe("left-middle");
    expect(fingerOfKey("n", "colemak")).toBe("right-index");
  });

  it("finds the finger for any character through its key", () => {
    expect(fingerOfChar("É", "latam")).toBe("left-middle");
    expect(fingerOfChar(":", "latam")).toBe("right-ring");
    expect(fingerOfChar("é", "dvorak")).toBeNull();
  });
});

describe("keyPosition", () => {
  it("counts rows from the numbers and columns from the 1/Q/A/Z column", () => {
    expect(keyPosition("q", "latam")).toEqual({ row: 1, column: 0 });
    expect(keyPosition("<", "es")).toEqual({ row: 3, column: -1 });
    expect(keyPosition("ñ", "us")).toBeNull();
  });
});

describe("layouts", () => {
  it("never lists a key twice, nor a character on two keys", () => {
    for (const layout of KEYBOARD_LAYOUTS) {
      const keys = layout.rows.flatMap((row) => row.keys);
      expect(new Set(keys).size, layout.id).toBe(keys.length);
      const made = [...keys, ...Object.keys(layout.shift), ...Object.keys(layout.altgr)];
      expect(new Set(made).size, layout.id).toBe(made.length);
    }
  });

  it("has every letter of the alphabet", () => {
    for (const layout of KEYBOARD_LAYOUTS) {
      for (const letter of "abcdefghijklmnopqrstuvwxyz") {
        expect(keyboardTarget(letter, layout), `${layout.id} ${letter}`).not.toBeNull();
      }
    }
  });

  it("finds a layout by id, or the default", () => {
    expect(layoutById("es").name).toBe("Español (España)");
    expect(layoutById("nope").id).toBe(DEFAULT_LAYOUT_ID);
  });

  it("guesses from the browser's language", () => {
    expect(guessLayoutId(["es-ES"])).toBe("es");
    expect(guessLayoutId(["es-AR", "es"])).toBe("latam");
    expect(guessLayoutId(["es-MX"])).toBe("latam");
    expect(guessLayoutId(["en-US"])).toBe("us");
    expect(guessLayoutId([])).toBe("latam");
  });
});
