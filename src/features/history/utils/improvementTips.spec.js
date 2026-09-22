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
    // ...and the tip can hand those straight to the training mode
    expect(weak.action).toEqual({
      label: "Entrenar estas",
      mode: "drill",
      keys: ["b", "r"],
    });
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

describe("computeImprovementTips · confusion patterns", () => {
  // b is a weak key (24% against a ~6% average), m is not (4%)
  const stats = [
    stat("a", 700, 35),
    stat("e", 660, 33),
    stat("m", 300, 12),
    stat("b", 90, 22),
  ];
  const confusion = (fields) => ({
    pair: "mn",
    expected: "m",
    typed: "n",
    slips: 9,
    shareOfKeyMisses: 0.6,
    ...fields,
  });

  it("leaves the existing tips untouched when there's nothing new to say", () => {
    expect(computeImprovementTips(stats)).toEqual(
      computeImprovementTips(stats, { confusions: [], transpositions: [] })
    );
  });

  it("names the key you reach for instead", () => {
    const tip = computeImprovementTips(stats, {
      confusions: [confusion()],
    }).tips.find((t) => t.id === "key-confusion");

    expect(tip.title).toBe("Confundís la M con la N");
    expect(tip.detail).toContain("6 de cada 10");
    expect(tip.detail).toContain("Son teclas vecinas");
    expect(tip.keys).toEqual(["m", "n"]);
  });

  it("says so plainly when the two keys aren't next to each other", () => {
    const tip = computeImprovementTips(stats, {
      confusions: [confusion({ pair: "mq", typed: "q" })],
    }).tips.find((t) => t.id === "key-confusion");

    expect(tip.detail).toContain("error de posición");
  });

  it("ignores a confusion that's neither frequent nor habitual enough", () => {
    const weak = computeImprovementTips(stats, {
      confusions: [confusion({ slips: 4 }), confusion({ shareOfKeyMisses: 0.2 })],
    });

    expect(tipIds(weak)).not.toContain("key-confusion");
  });

  it("folds the confusion into the weak-key tip instead of spending a slot", () => {
    const { tips } = computeImprovementTips(stats, {
      confusions: [confusion({ pair: "bv", expected: "b", typed: "v" })],
    });

    expect(tips.map((t) => t.id)).not.toContain("key-confusion");
    expect(tips.find((t) => t.id === "weak-keys").detail).toContain(
      "6 de cada 10 veces apretás la V"
    );
  });

  it("calls out swapped letters once they're a habit", () => {
    const tip = computeImprovementTips(stats, {
      transpositions: [
        { pair: "ue", typedAs: "eu", count: 8 },
        { pair: "sa", typedAs: "as", count: 4 },
      ],
    }).tips.find((t) => t.id === "transposition");

    expect(tip.detail).toContain("12 veces");
    expect(tip.detail).toContain("«ue»");
    expect(tip.detail).toContain("«eu»");
  });

  it("ignores a handful of swaps", () => {
    expect(
      tipIds(
        computeImprovementTips(stats, {
          transpositions: [{ pair: "ue", typedAs: "eu", count: 6 }],
        })
      )
    ).not.toContain("transposition");
  });

  it("never spends two slots on the same kind of pattern", () => {
    const ids = tipIds(
      computeImprovementTips(stats, {
        confusions: [confusion()],
        transpositions: [{ pair: "ue", typedAs: "eu", count: 12 }],
      })
    );

    expect(
      ids.filter((id) => id === "key-confusion" || id === "transposition")
    ).toHaveLength(1);
  });

  it("keeps the four most severe tips when everything fires at once", () => {
    const crowded = [
      stat(" ", 300, 60),
      stat("q", 100, 30),
      stat("w", 100, 30),
      stat("m", 300, 12),
      stat("j", 100, 2),
      stat("k", 100, 2),
      stat("1", 40, 12),
      stat("á", 20, 8),
    ];
    const { tips } = computeImprovementTips(crowded, {
      averageAccuracy: 80,
      confusions: [confusion()],
      transpositions: [{ pair: "ue", typedAs: "eu", count: 40 }],
    });

    expect(tips).toHaveLength(4);
    // The generic "slow down" advice loses to anything pointing at a key
    expect(tipIds({ tips })).not.toContain("slow-down");
  });
});

describe("computeImprovementTips · speed patterns", () => {
  // A clean typist: nothing is missed often enough to be a weak key
  const stats = [stat("a", 700, 21), stat("e", 660, 20), stat("ñ", 200, 6)];
  const timing = (fields) => ({
    key: "ñ",
    meanMs: 310,
    samples: 600,
    ratio: 1.42,
    ...fields,
  });
  const pair = (fields) => ({
    pair: "ll",
    meanMs: 340,
    samples: 120,
    ratio: 1.62,
    ...fields,
  });

  it("names the keys that slow you down even though you don't miss them", () => {
    const tip = computeImprovementTips(stats, {
      keyTiming: [timing()],
    }).tips.find((t) => t.id === "slow-keys");

    expect(tip.title).toBe("Te frena la Ñ");
    expect(tip.detail).toContain("42% más de tiempo");
    expect(tip.detail).toContain("310 ms contra tus 218 ms");
    expect(tip.keys).toEqual(["ñ"]);
  });

  it("repeats the article when it names two keys", () => {
    const tip = computeImprovementTips(stats, {
      keyTiming: [timing(), timing({ key: "q", ratio: 1.38, meanMs: 300 })],
    }).tips.find((t) => t.id === "slow-keys");

    expect(tip.title).toBe("Te frenan la Ñ y la Q");
  });

  it("waits for enough measured intervals before talking about speed", () => {
    expect(
      tipIds(computeImprovementTips(stats, { keyTiming: [timing({ samples: 120 })] }))
    ).not.toContain("slow-keys");
  });

  it("ignores a key that's only a little slower than the rest", () => {
    expect(
      tipIds(computeImprovementTips(stats, { keyTiming: [timing({ ratio: 1.15 })] }))
    ).not.toContain("slow-keys");
  });

  it("leaves out a slow key that's already being reported as a weak one", () => {
    // b is missed 24% of the time against a ~3% average: a weak key
    const withWeak = [...stats, stat("b", 90, 22)];
    const { tips } = computeImprovementTips(withWeak, {
      keyTiming: [timing({ key: "b" }), timing({ samples: 300 })],
    });
    const slow = tips.find((t) => t.id === "slow-keys");

    expect(tips.find((t) => t.id === "weak-keys").keys).toContain("b");
    expect(slow.keys).toEqual(["ñ"]);
  });

  it("names the slowest transitions", () => {
    const tip = computeImprovementTips(stats, {
      keyTiming: [timing({ ratio: 1 })],
      bigramTiming: [pair()],
    }).tips.find((t) => t.id === "slow-bigrams");

    expect(tip.title).toBe("Tus combinaciones más lentas: ll");
    expect(tip.detail).toContain("«ll»");
    expect(tip.detail).toContain("62% más");
  });

  it("spells out an invisible key in the pair", () => {
    const tip = computeImprovementTips(stats, {
      keyTiming: [timing({ ratio: 1 })],
      bigramTiming: [pair({ pair: "s " })],
    }).tips.find((t) => t.id === "slow-bigrams");

    expect(tip.title).toContain("s + espacio");
  });

  it("never spends two slots on speed", () => {
    const ids = tipIds(
      computeImprovementTips(stats, { keyTiming: [timing()], bigramTiming: [pair()] })
    );

    expect(ids.filter((id) => id === "slow-keys" || id === "slow-bigrams")).toHaveLength(
      1
    );
  });

  it("says nothing new when there is no timing data", () => {
    expect(computeImprovementTips(stats)).toEqual(
      computeImprovementTips(stats, { keyTiming: [], bigramTiming: [] })
    );
  });

  it("names the whole words you stumble on, with a drill on them", () => {
    const stats = [{ key: "a", attempts: 300, misses: 9, rate: 0.03 }];
    const { tips } = computeImprovementTips(stats, {
      problemWords: [
        { word: "desarrollo", times: 5, errors: 4, errorRate: 0.8, slowRatio: 1.1 },
        { word: "exactamente", times: 4, errors: 0, errorRate: 0, slowRatio: 1.9 },
      ],
    });
    const tip = tips.find((t) => t.id === "problem-words");
    expect(tip.title).toBe("Se te traban «desarrollo» y «exactamente»");
    expect(tip.action).toEqual({
      label: "Entrenar estas",
      mode: "drill",
      words: ["desarrollo", "exactamente"],
    });
  });
});
