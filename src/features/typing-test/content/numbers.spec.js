import { describe, it, expect } from "vitest";
import { generateRandomNumbers } from "./numbers";
import { formatReferenceText } from "@/features/typing-test/utils/textFormat";

describe("generateRandomNumbers", () => {
  it("returns the requested number of groups", () => {
    expect(generateRandomNumbers(25).split(" ")).toHaveLength(25);
  });

  it("only uses digits and number-related symbols", () => {
    expect(generateRandomNumbers(200)).toMatch(/^[0-9.,%: ]+$/);
  });

  it("leaves only digits once punctuation is stripped", () => {
    const groups = formatReferenceText(generateRandomNumbers(200)).split(" ");
    expect(groups).toHaveLength(200);
    for (const group of groups) {
      expect(group).toMatch(/^[0-9]+$/);
    }
  });

  it("never repeats the same group twice in a row", () => {
    const groups = generateRandomNumbers(100).split(" ");
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]).not.toBe(groups[i - 1]);
    }
  });

  it("returns an empty string for a count of 0", () => {
    expect(generateRandomNumbers(0)).toBe("");
  });
});
