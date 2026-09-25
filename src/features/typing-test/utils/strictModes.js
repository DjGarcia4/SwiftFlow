// The demanding ways to play, on top of any mode. Two decide what a
// mistake does -- ends the run, or has to be fixed before going on -- and
// a third sets how accurate a run has to be to count at all. A run that
// fails any of them isn't saved, the same as one cut short with Esc; one
// that makes it is an ordinary run that happens to be flagged.

export const STRICT_MODES = [
  {
    id: "sudden-death",
    label: "Muerte súbita",
    short: "1 vida",
    detail: "El primer error termina la partida",
  },
  {
    id: "must-correct",
    label: "Corregir para avanzar",
    short: "Corregir",
    detail: "Una letra equivocada no entra: hay que acertarla para seguir",
  },
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
    return "Muerte súbita: un error y afuera · no cuenta para el historial";
  }
  return `Precisión de ${Math.floor(failure.accuracy)} %, por debajo del ${failure.minAccuracy} % · no cuenta para el historial`;
};
