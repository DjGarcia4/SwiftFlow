import { describe, it, expect } from "vitest";
import { detectComboMilestone, pickComboMessage, comboProgress } from "./comboMilestones";

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

describe("comboProgress", () => {
  it("fills from zero toward the first milestone", () => {
    expect(comboProgress(0)).toEqual({ from: 0, next: 25, fraction: 0 });
    expect(comboProgress(10)).toMatchObject({ next: 25, fraction: 0.4 });
  });

  it("starts over from each milestone reached", () => {
    expect(comboProgress(25)).toEqual({ from: 25, next: 50, fraction: 0 });
    expect(comboProgress(75)).toMatchObject({ from: 50, next: 100, fraction: 0.5 });
  });

  it("stays full past the last milestone", () => {
    expect(comboProgress(1200)).toEqual({ from: 1000, next: null, fraction: 1 });
  });
});
