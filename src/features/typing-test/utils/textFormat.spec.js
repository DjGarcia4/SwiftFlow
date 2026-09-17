import { describe, it, expect } from "vitest";
import { formatReferenceText } from "./textFormat";

describe("formatReferenceText", () => {
  it("lowercases the text", () => {
    expect(formatReferenceText("HOLA Mundo")).toBe("hola mundo");
  });

  it("strips accents", () => {
    expect(formatReferenceText("áéíóú")).toBe("aeiou");
  });

  it("leaves the ñ alone -- it's a letter, not an accented n", () => {
    // "año" and "ano" are different words; so are "sueño" and "sueno"
    expect(formatReferenceText("El niño soñó un año en la mañana")).toBe(
      "el niño soño un año en la mañana"
    );
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
