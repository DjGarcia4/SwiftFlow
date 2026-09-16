import { describe, it, expect } from "vitest";
import { computeImprovementTips } from "./improvementTips";

const stat = (key, attempts, misses) => ({
  key,
  attempts,
  misses,
  rate: misses / attempts,
});

const tipIds = (result) => result.tips.map((t) => t.id);

describe("computeImprovementTips", () => {
  it("waits for enough data before giving advice", () => {
    const result = computeImprovementTips([stat("a", 50, 5)]);
    expect(result).toEqual({ enoughData: false, tips: [] });
  });

  it("ranks weak keys by miss rate, not raw misses", () => {
    // Based on a real history: space misses most but is typed the most
    const stats = [
      stat(" ", 133, 16),
      stat("e", 87, 13),
      stat("n", 53, 9),
      stat("s", 50, 8),
      stat("o", 67, 8),
      stat("r", 37, 7),
      stat("i", 50, 7),
      stat("c", 30, 6),
      stat("a", 120, 4),
    ];
    const { tips } = computeImprovementTips(stats);
    const weak = tips.find((t) => t.id === "weak-keys");

    expect(weak.keys).toEqual(["c", "r", "n"]);
    expect(weak.title).toBe("Practicá la C, R y N");
    expect(weak.detail).toContain("1 de cada 5");
  });

  it("only lists letters as weak keys (digits and symbols have their own tips)", () => {
    const stats = [
      stat("a", 300, 6),
      stat("1", 30, 12),
      stat(",", 30, 12),
      stat("c", 30, 9),
    ];
    expect(
      computeImprovementTips(stats).tips.find((t) => t.id === "weak-keys").keys
    ).toEqual(["c"]);
  });

  it("calls out space when it's the biggest source of mistakes", () => {
    const stats = [stat(" ", 150, 20), stat("a", 100, 5), stat("e", 100, 5)];
    expect(tipIds(computeImprovementTips(stats))).toContain("space");
  });

  it("points out a weaker hand", () => {
    const stats = [
      stat("a", 100, 20),
      stat("s", 100, 20),
      stat("j", 100, 5),
      stat("k", 100, 5),
    ];
    const { tips } = computeImprovementTips(stats);
    expect(tips.find((t) => t.id === "hand" || t.id === "row")?.title).toBe(
      "Tu mano izquierda falla más"
    );
  });

  it("suggests the numbers mode when digits are weak", () => {
    const stats = [stat("a", 200, 4), stat("1", 30, 6)];
    const tip = computeImprovementTips(stats).tips.find((t) => t.id === "digits");
    expect(tip.action).toEqual({ label: "Practicar números", mode: "numbers" });
  });

  it("balances speed and accuracy from the recent average", () => {
    const stats = [stat("a", 300, 3)];
    expect(tipIds(computeImprovementTips(stats, { averageAccuracy: 88 }))).toContain(
      "slow-down"
    );
    expect(tipIds(computeImprovementTips(stats, { averageAccuracy: 98 }))).toContain(
      "speed-up"
    );
  });

  it("gives no tips when there's no clear pattern", () => {
    const stats = [stat("a", 100, 5), stat("e", 100, 5), stat("o", 100, 5)];
    expect(computeImprovementTips(stats, { averageAccuracy: 95 }).tips).toEqual([]);
  });

  it("never returns more than 4 tips", () => {
    const stats = [
      stat(" ", 300, 60),
      stat("c", 40, 12),
      stat("q", 100, 30),
      stat("w", 100, 30),
      stat("j", 100, 2),
      stat("k", 100, 2),
      stat("1", 40, 12),
      stat("á", 20, 8),
    ];
    const { tips } = computeImprovementTips(stats, { averageAccuracy: 80 });
    expect(tips.length).toBe(4);
  });
});
