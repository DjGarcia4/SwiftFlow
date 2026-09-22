import { describe, it, expect } from "vitest";
import { computeLiveCoach } from "./liveCoach";

// A session of mostly clean "e"s plus whatever the test adds on top
const session = ({ attempts = {}, misses = {}, confusions = {} } = {}) => ({
  keyAttempts: { e: 60, ...attempts },
  missedKeys: { e: 1, ...misses },
  confusions,
});

describe("computeLiveCoach", () => {
  it("stays quiet at the start of a session", () => {
    expect(
      computeLiveCoach({ keyAttempts: { r: 10 }, missedKeys: { r: 5 }, confusions: {} })
    ).toBeNull();
  });

  it("stays quiet when nothing stands out", () => {
    expect(computeLiveCoach(session())).toBeNull();
  });

  it("names a letter that keeps getting missed", () => {
    const coach = computeLiveCoach(session({ attempts: { r: 12 }, misses: { r: 4 } }));
    expect(coach.keys).toEqual(["r"]);
    expect(coach.title).toBe("Se te escapa la R");
    expect(coach.detail).toBe("La R te salió mal 4 de 12 veces.");
  });

  it("needs more than a couple of misses", () => {
    expect(
      computeLiveCoach(session({ attempts: { r: 4 }, misses: { r: 2 } }))
    ).toBeNull();
  });

  it("treats upper and lower case as the same key", () => {
    const coach = computeLiveCoach(
      session({ attempts: { r: 6, R: 6 }, misses: { r: 2, R: 2 } })
    );
    expect(coach.keys).toEqual(["r"]);
  });

  it("ignores anything that isn't a letter, which the drill can't practice", () => {
    expect(
      computeLiveCoach(
        session({ attempts: { " ": 20, 4: 10 }, misses: { " ": 6, 4: 5 } })
      )
    ).toBeNull();
  });

  it("lists up to three letters, worst first", () => {
    const coach = computeLiveCoach(
      session({
        attempts: { r: 10, t: 10, ñ: 10, q: 10 },
        misses: { r: 3, t: 6, ñ: 5, q: 4 },
      })
    );
    expect(coach.keys).toEqual(["t", "ñ", "q"]);
    expect(coach.title).toBe("Se te escapan la T, la Ñ y la Q");
  });

  it("mentions the key pressed instead when it's a habit", () => {
    const coach = computeLiveCoach(
      session({ attempts: { r: 12 }, misses: { r: 4 }, confusions: { rt: 3, re: 1 } })
    );
    expect(coach.detail).toBe(
      "La R te salió mal 4 de 12 veces y 3 veces apretaste la T."
    );
  });
});
