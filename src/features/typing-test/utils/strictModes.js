// The demanding ways to play, on top of any mode. Two decide what a
// mistake does -- ends the run, or has to be fixed before going on -- and
// a third sets how accurate a run has to be to count at all. A run that
// fails any of them isn't saved, the same as one cut short with Esc; one
// that makes it is an ordinary run that happens to be flagged.
import { t } from "@/shared/i18n";

// Their words come from the typing messages, read when shown
const worded = (id, key) => ({
  id,
  get label() {
    return t(`typing.strict.${key}.label`);
  },
  get short() {
    return t(`typing.strict.${key}.short`);
  },
  get detail() {
    return t(`typing.strict.${key}.detail`);
  },
});

export const STRICT_MODES = [
  worded("sudden-death", "suddenDeath"),
  worded("must-correct", "mustCorrect"),
];

export const MIN_ACCURACY_OPTIONS = [90, 95, 98];

export const isStrictMode = (id) => STRICT_MODES.some((mode) => mode.id === id);
export const strictModeById = (id) => STRICT_MODES.find((mode) => mode.id === id) ?? null;
export const isMinAccuracy = (value) => MIN_ACCURACY_OPTIONS.includes(value);

// The input up to its first wrong character: with "must-correct" on, a
// wrong key never makes it into the text
export const upToFirstMistake = (input, reference) => {
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== reference[i]) return input.slice(0, i);
  }
  return input;
};

// Why a finished run doesn't count, or null if it does. `diedAt` is where
// sudden death struck, when it did.
export const runFailure = ({ diedAt = null, minAccuracy = null, accuracy }) => {
  if (diedAt !== null) return { reason: "sudden-death", index: diedAt };
  if (minAccuracy && accuracy < minAccuracy) {
    return { reason: "min-accuracy", minAccuracy, accuracy };
  }
  return null;
};

export const describeFailure = (failure) => {
  if (!failure) return null;
  if (failure.reason === "sudden-death") {
    return t("typing.strict.diedMessage");
  }
  return t(
    "typing.strict.belowMessage",
    Math.floor(failure.accuracy),
    failure.minAccuracy
  );
};
