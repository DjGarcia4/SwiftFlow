import { describe, it, expect } from "vitest";
import { detectComboMilestone, pickComboMessage } from "./comboMilestones";

describe("detectComboMilestone", () => {
  it("fires when a new correct character reaches a milestone", () => {
    expect(detectComboMilestone(24, 25, new Set())).toBe(25);
    expect(detectComboMilestone(99, 100, new Set())).toBe(100);
  });

  it("ignores streaks that aren't milestones", () => {
    expect(detectComboMilestone(25, 26, new Set())).toBeNull();
  });

  it("ignores jumps, like fixing a typo with backspace", () => {
    expect(detectComboMilestone(0, 50, new Set())).toBeNull();
  });

  it("celebrates early milestones only once per session", () => {
    expect(detectComboMilestone(49, 50, new Set([50]))).toBeNull();
  });

  it("repeats big milestones on every run that reaches them", () => {
    expect(detectComboMilestone(99, 100, new Set([100]))).toBe(100);
  });
});

describe("pickComboMessage", () => {
  it("picks a message from the milestone's tier", () => {
    expect(pickComboMessage(25, () => 0)).toBe("¡Buen ritmo!");
    expect(pickComboMessage(120, () => 0)).toBe("¡Imparable!");
    expect(pickComboMessage(1000, () => 0.99)).toBe("¡Mil sin un error!");
  });
});
