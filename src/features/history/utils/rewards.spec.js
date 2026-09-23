import { describe, it, expect } from "vitest";
import {
  REWARDS,
  REWARD_KINDS,
  DEFAULT_REWARDS,
  effectiveReward,
  rewardsUnlockedBetween,
  nextReward,
} from "./rewards";
import { MAX_LEVEL } from "./experience";

describe("the reward catalog", () => {
  it("has a free default for every kind, and nothing past the top level", () => {
    for (const kind of REWARD_KINDS) {
      const reward = REWARDS.find((r) => r.id === DEFAULT_REWARDS[kind]);
      expect(reward).toMatchObject({ kind, level: 1 });
    }
    expect(Math.max(...REWARDS.map((r) => r.level))).toBeLessThanOrEqual(MAX_LEVEL);
  });

  it("has no two rewards with the same id", () => {
    expect(new Set(REWARDS.map((r) => r.id)).size).toBe(REWARDS.length);
  });
});

describe("effectiveReward", () => {
  it("gives what was chosen once it's unlocked", () => {
    expect(effectiveReward("accent", "violet", 7)).toBe("violet");
  });

  it("falls back to the default while it's locked, or if it's unknown", () => {
    expect(effectiveReward("accent", "violet", 6)).toBe("orange");
    expect(effectiveReward("caret", "nonsense", 50)).toBe("bar");
    // The right id for the wrong kind
    expect(effectiveReward("sound", "violet", 50)).toBe("soft");
  });
});

describe("rewardsUnlockedBetween", () => {
  it("lists what a level-up unlocked", () => {
    expect(rewardsUnlockedBetween(3, 5).map((r) => r.id)).toEqual([
      "block",
      "mechanical",
    ]);
    expect(rewardsUnlockedBetween(5, 6)).toEqual([]);
  });
});

describe("nextReward", () => {
  it("is the next one still to earn", () => {
    expect(nextReward(1).id).toBe("sky");
    expect(nextReward(MAX_LEVEL)).toBeNull();
  });
});
