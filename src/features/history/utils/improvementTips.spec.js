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

  it("ranks weak keys by the misses they cost, not by raw count or rate alone", () => {
    // Based on a real history: the R leads on raw misses only because it's
    // typed constantly, while the B fails far more often per attempt.
    const stats = [
      stat("a", 700, 35),
      stat("e", 660, 33),
      stat("s", 460, 37),
      stat("r", 440, 44),
      stat("b", 90, 22),
    ];
    const weak = computeImprovementTips(stats).tips.find((t) => t.id === "weak-keys");

    expect(weak.keys).toEqual(["b", "r"]);
    expect(weak.title).toBe("Practicá la B y R");
    expect(weak.detail).toContain("1 de cada 4");
    expect(weak.detail).toContain("22 errores");
  });

  it("ignores rare letters whose rate comes from a handful of attempts", () => {
    // The X at 25% off 40 tries is noise; the B at 24% off 90 isn't.
    const stats = [
      stat("a", 700, 35),
      stat("e", 660, 33),
      stat("b", 90, 22),
      stat("x", 40, 10),
      stat("q", 70, 4),
    ];
    const weak = computeImprovementTips(stats).tips.find((t) => t.id === "weak-keys");

    expect(weak.keys).toEqual(["b"]);
  });

  it("explains why the most-missed key isn't the one to practice", () => {
    const stats = [stat("a", 700, 21), stat("r", 500, 38), stat("b", 90, 22)];
    const weak = computeImprovementTips(stats).tips.find((t) => t.id === "weak-keys");

    expect(weak.keys).toEqual(["b"]);
    expect(weak.detail).toContain("La R suma más errores");
  });

  it("only lists letters as weak keys (digits and symbols have their own tips)", () => {
    const stats = [
      stat("a", 300, 6),
      stat("1", 30, 12),
      stat(",", 30, 12),
      stat("c", 80, 20),
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
