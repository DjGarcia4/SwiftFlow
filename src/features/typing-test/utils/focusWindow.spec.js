import { describe, it, expect } from "vitest";
import { groupIntoWords, focusWindow } from "./textGroups";

// The window as the text it shows
const shown = (text, position) =>
  focusWindow(groupIntoWords(text), position)
    .map((group) =>
      group.type === "word" ? group.chars.map((c) => c.char).join("") : group.char
    )
    .join("");

describe("focusWindow", () => {
  it("shows the word being typed and the next one", () => {
    expect(shown("uno dos tres", 0)).toBe("uno dos");
    expect(shown("uno dos tres", 2)).toBe("uno dos");
    expect(shown("uno dos tres", 5)).toBe("dos tres");
  });

  it("keeps the word on screen while its space is still to type", () => {
    expect(shown("uno dos tres", 3)).toBe("uno dos");
    expect(shown("uno dos tres", 7)).toBe("dos tres");
  });

  it("shows the last word alone at the end", () => {
    expect(shown("uno dos tres", 9)).toBe("tres");
    expect(shown("uno dos tres", 12)).toBe("");
  });

  it("follows code's line breaks and indentation", () => {
    expect(shown("if (x) {\n  y();\n}", 8)).toBe("{\n  y();");
    expect(shown("if (x) {\n  y();\n}", 10)).toBe(" y();\n}");
  });
});
