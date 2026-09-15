import { describe, it, expect } from "vitest";
import { formatReferenceText } from "./textFormat";

describe("formatReferenceText", () => {
  it("lowercases the text", () => {
    expect(formatReferenceText("HOLA Mundo")).toBe("hola mundo");
  });

  it("strips accents", () => {
    // NFD-decomposes "ñ" too (n + combining tilde), same as the app's
    // existing behavior — this isn't a language-perfect stripper.
    expect(formatReferenceText("áéíóú ñ")).toBe("aeiou n");
  });

  it("strips punctuation and symbols", () => {
    expect(formatReferenceText('¡Hola, "mundo"! (test) [100%] #tag @user')).toBe(
      "¡hola mundo test 100 tag user"
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(formatReferenceText("  hola  ")).toBe("hola");
  });

  it("leaves already-plain text untouched", () => {
    expect(formatReferenceText("hola mundo")).toBe("hola mundo");
  });
});
