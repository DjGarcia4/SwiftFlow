import { describe, it, expect } from "vitest";
import { groupIntoWords } from "./textGroups";

describe("groupIntoWords", () => {
  it("returns an empty array for empty text", () => {
    expect(groupIntoWords("")).toEqual([]);
  });

  it("groups a single word with its character indices", () => {
    expect(groupIntoWords("hola")).toEqual([
      {
        type: "word",
        chars: [
          { char: "h", index: 0 },
          { char: "o", index: 1 },
          { char: "l", index: 2 },
          { char: "a", index: 3 },
        ],
      },
    ]);
  });

  it("splits on spaces into word and space groups", () => {
    const groups = groupIntoWords("hi bye");
    expect(groups.map((g) => g.type)).toEqual(["word", "space", "word"]);
    expect(groups[1]).toEqual({ type: "space", index: 2, char: " " });
  });

  it("treats a newline as its own space-type group", () => {
    const groups = groupIntoWords("a\nb");
    expect(groups).toEqual([
      { type: "word", chars: [{ char: "a", index: 0 }] },
      { type: "space", index: 1, char: "\n" },
      { type: "word", chars: [{ char: "b", index: 2 }] },
    ]);
  });

  it("handles consecutive spaces without merging them", () => {
    const groups = groupIntoWords("a  b");
    expect(groups.map((g) => g.type)).toEqual(["word", "space", "space", "word"]);
  });
});
