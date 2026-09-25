import { describe, it, expect } from "vitest";
import {
  upToFirstMistake,
  runFailure,
  describeFailure,
  isStrictMode,
  isMinAccuracy,
} from "./strictModes";

describe("upToFirstMistake", () => {
  it("keeps everything that's right", () => {
    expect(upToFirstMistake("hola", "hola mundo")).toBe("hola");
    expect(upToFirstMistake("", "hola")).toBe("");
  });

  it("drops the first wrong character and whatever came after it", () => {
    expect(upToFirstMistake("holx", "hola")).toBe("hol");
    expect(upToFirstMistake("hxla", "hola")).toBe("h");
  });
});

describe("runFailure", () => {
  it("fails a run that sudden death ended", () => {
    expect(runFailure({ diedAt: 12, accuracy: 99 })).toEqual({
      reason: "sudden-death",
      index: 12,
    });
  });

  it("fails a run under the minimum accuracy, and passes one at it", () => {
    expect(runFailure({ minAccuracy: 95, accuracy: 94.6 })).toEqual({
      reason: "min-accuracy",
      minAccuracy: 95,
      accuracy: 94.6,
    });
    expect(runFailure({ minAccuracy: 95, accuracy: 95 })).toBeNull();
    expect(runFailure({ accuracy: 50 })).toBeNull();
  });
});

describe("describeFailure", () => {
  it("says why the run doesn't count, never rounding up past the bar", () => {
    expect(
      describeFailure({ reason: "min-accuracy", minAccuracy: 95, accuracy: 94.9 })
    ).toBe("Precisión de 94 %, por debajo del 95 % · no cuenta para el historial");
    expect(describeFailure({ reason: "sudden-death", index: 3 })).toMatch(
      /Muerte súbita/
    );
    expect(describeFailure(null)).toBeNull();
  });
});

describe("options", () => {
  it("knows its own modes and thresholds", () => {
    expect(isStrictMode("sudden-death")).toBe(true);
    expect(isStrictMode("hardcore")).toBe(false);
    expect(isMinAccuracy(95)).toBe(true);
    expect(isMinAccuracy(97)).toBe(false);
  });
});
