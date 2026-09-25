import { describe, it, expect } from "vitest";
import { classics, getRandomClassic } from "./classics";
import { keyboardTarget } from "@/features/typing-test/utils/keyboardMap";
import { KEYBOARD_LAYOUTS } from "@/features/typing-test/utils/keyboardLayouts";

describe("classics", () => {
  it("gives every passage its own id, an author and a work", () => {
    expect(new Set(classics.map((c) => c.id)).size).toBe(classics.length);
    for (const passage of classics) {
      expect(passage.author).toBeTruthy();
      expect(passage.work).toBeTruthy();
    }
  });

  it("only asks for characters a Spanish keyboard can type", () => {
    const spanish = KEYBOARD_LAYOUTS.filter((layout) =>
      ["latam", "es"].includes(layout.id)
    );
    for (const { id, text } of classics) {
      for (const char of text) {
        if (char === "\n") continue;
        for (const layout of spanish) {
          expect(
            keyboardTarget(char, layout),
            `${id}: «${char}» on ${layout.id}`
          ).not.toBeNull();
        }
      }
    }
  });

  it("has no stray spaces around its line breaks", () => {
    for (const { id, text } of classics) {
      expect(text, id).not.toMatch(/ \n|\n | {2}/);
      expect(text, id).toBe(text.trim());
    }
  });

  it("never picks the same passage twice in a row", () => {
    for (let i = 0; i < 50; i++) {
      const first = getRandomClassic(null);
      expect(getRandomClassic(first.id).id).not.toBe(first.id);
    }
  });
});
