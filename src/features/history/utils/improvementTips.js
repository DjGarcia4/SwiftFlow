// Turns the per-key error stats into a short list of concrete, readable
// "work on this" tips. Pure data in, pure data out (icons are string keys),
// so it's easy to test and the view decides how to render it.

// Below this many keystrokes overall, patterns are mostly noise.
export const MIN_TOTAL_ATTEMPTS = 200;
// A key needs this many attempts before its miss rate means anything.
const MIN_KEY_ATTEMPTS = 20;
// "Clearly worse than your average" — not just a hair above it.
const WEAK_FACTOR = 1.25;
// A group (hand/row) only stands out when it's this much worse than the best.
const GROUP_GAP = 1.3;
const MIN_GROUP_ATTEMPTS = 50;
const MAX_TIPS = 4;

const LEFT_HAND = new Set([..."qwertasdfgzxcvb12345"]);
const RIGHT_HAND = new Set([..."yuiophjklñnm67890"]);
const ROWS = [
  { name: "de arriba", keys: new Set([..."qwertyuiop"]) },
  { name: "del medio", keys: new Set([..."asdfghjklñ"]) },
  { name: "de abajo", keys: new Set([..."zxcvbnm"]) },
];
const DIGITS = new Set([..."0123456789"]);
const ACCENTED = new Set([..."áéíóúü"]);

const percent = (rate) => `${Math.round(rate * 100)}%`;

// "1 de cada 5" reads better than "20%" for a single key
const oneIn = (rate) => `1 de cada ${Math.max(2, Math.round(1 / rate))}`;

const joinKeys = (keys) =>
  keys.length === 1
    ? keys[0]
    : `${keys.slice(0, -1).join(", ")} y ${keys[keys.length - 1]}`;

const groupRate = (stats, keySet) => {
  let attempts = 0;
  let misses = 0;
  for (const stat of stats) {
    if (keySet.has(stat.key)) {
      attempts += stat.attempts;
      misses += stat.misses;
    }
  }
  return { attempts, misses, rate: attempts ? misses / attempts : 0 };
};

// keyStats: output of computeKeyErrorStats. averageAccuracy: recent average
// (null when unknown).
export const computeImprovementTips = (keyStats, { averageAccuracy = null } = {}) => {
  const totalAttempts = keyStats.reduce((sum, s) => sum + s.attempts, 0);
  if (totalAttempts < MIN_TOTAL_ATTEMPTS) return { enoughData: false, tips: [] };

  const totalMisses = keyStats.reduce((sum, s) => sum + s.misses, 0);
  const overallRate = totalMisses / totalAttempts;
  const tips = [];

  // 1. The specific letters that fail most often (by rate, not raw count —
  //    the most-typed keys naturally rack up the most misses). Digits,
  //    space and symbols get their own tips below.
  const weakKeys = keyStats
    .filter(
      (s) =>
        /^\p{L}$/u.test(s.key) &&
        s.attempts >= MIN_KEY_ATTEMPTS &&
        s.misses > 0 &&
        s.rate >= overallRate * WEAK_FACTOR
    )
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  if (weakKeys.length) {
    tips.push({
      id: "weak-keys",
      icon: "target",
      title: `Practicá la ${joinKeys(weakKeys.map((s) => s.key.toUpperCase()))}`,
      detail: `${weakKeys.length === 1 ? "Es la tecla" : "Son las teclas"} que más fallás: la ${weakKeys[0].key.toUpperCase()} te sale mal ${oneIn(weakKeys[0].rate)} veces (tu promedio es ${percent(overallRate)}).`,
      keys: weakKeys.map((s) => s.key),
    });
  }

  // 2. Space as the #1 source of mistakes
  const space = keyStats.find((s) => s.key === " ");
  const topByMisses = [...keyStats].sort((a, b) => b.misses - a.misses)[0];
  if (space && topByMisses === space && space.misses >= 5) {
    tips.push({
      id: "space",
      icon: "space",
      title: "Cuidá los espacios",
      detail: `Es donde más errores acumulás (${space.misses}). Suele pasar por adelantarte a la siguiente palabra: terminá cada palabra antes de pegar el espacio.`,
      keys: [" "],
    });
  }

  // 3. A hand or a keyboard row that's noticeably weaker — whichever gap is
  //    bigger, so the two don't repeat the same story.
  const groupCandidates = [];

  const left = groupRate(keyStats, LEFT_HAND);
  const right = groupRate(keyStats, RIGHT_HAND);
  if (left.attempts >= MIN_GROUP_ATTEMPTS && right.attempts >= MIN_GROUP_ATTEMPTS) {
    const [worse, better, name] =
      left.rate >= right.rate ? [left, right, "izquierda"] : [right, left, "derecha"];
    if (better.rate > 0 && worse.rate / better.rate >= GROUP_GAP) {
      groupCandidates.push({
        gap: worse.rate / better.rate,
        tip: {
          id: "hand",
          icon: "hand",
          title: `Tu mano ${name} falla más`,
          detail: `Errás el ${percent(worse.rate)} de sus teclas contra el ${percent(better.rate)} de la otra. Vale la pena ejercitarla aparte.`,
        },
      });
    }
  }

  const rows = ROWS.map((row) => ({ ...row, ...groupRate(keyStats, row.keys) })).filter(
    (row) => row.attempts >= MIN_GROUP_ATTEMPTS
  );
  if (rows.length >= 2) {
    const sorted = [...rows].sort((a, b) => b.rate - a.rate);
    const [worst, best] = [sorted[0], sorted[sorted.length - 1]];
    if (best.rate > 0 && worst.rate / best.rate >= GROUP_GAP) {
      groupCandidates.push({
        gap: worst.rate / best.rate,
        tip: {
          id: "row",
          icon: "rows",
          title: `La fila ${worst.name} te cuesta más`,
          detail: `Fallás el ${percent(worst.rate)} ahí contra el ${percent(best.rate)} en la fila ${best.name}. Practicá llegar a esas teclas sin mirar.`,
        },
      });
    }
  }

  if (groupCandidates.length) {
    tips.push(groupCandidates.sort((a, b) => b.gap - a.gap)[0].tip);
  }

  // 4. Numbers and accents: whole skills with their own practice path
  const digits = groupRate(keyStats, DIGITS);
  if (digits.attempts >= MIN_KEY_ATTEMPTS && digits.rate >= overallRate * WEAK_FACTOR) {
    tips.push({
      id: "digits",
      icon: "hashtag",
      title: "Los números te cuestan",
      detail: `Fallás el ${percent(digits.rate)} de los dígitos. El modo Números es ideal para eso.`,
      action: { label: "Practicar números", mode: "numbers" },
    });
  }

  const accents = groupRate(keyStats, ACCENTED);
  if (accents.attempts >= 10 && accents.rate >= overallRate * WEAK_FACTOR) {
    tips.push({
      id: "accents",
      icon: "language",
      title: "Ojo con las tildes",
      detail: `Fallás el ${percent(accents.rate)} de las letras con tilde. Practicá la combinación de la tecla de acento con la vocal.`,
    });
  }

  // 5. The speed/accuracy balance, from recent sessions
  if (averageAccuracy !== null && averageAccuracy < 92) {
    tips.push({
      id: "slow-down",
      icon: "gauge",
      title: "Bajá un poco la velocidad",
      detail: `Tu precisión reciente es ${averageAccuracy}%. Con más de 95% cada error cuesta menos y la velocidad sube sola.`,
    });
  } else if (averageAccuracy !== null && averageAccuracy >= 97) {
    tips.push({
      id: "speed-up",
      icon: "bolt",
      title: "Podés apretar el ritmo",
      detail: `Tu precisión reciente es ${averageAccuracy}%: está excelente. Es buen momento para empujar la velocidad.`,
    });
  }

  return { enoughData: true, tips: tips.slice(0, MAX_TIPS) };
};
