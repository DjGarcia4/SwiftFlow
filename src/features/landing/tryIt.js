// "Probalo acá": one short sentence typed right on the landing, and back
// comes the wpm and one real thing about how you typed it -- the point of
// SwiftFlow in fifteen seconds. Nothing here is saved to the history.
import { computeWpm } from "@/features/typing-test/utils/typingMetrics";
import { t, locale } from "@/shared/i18n";

// Short, and with a Ñ, accents and a capital: the Spanish keyboard is the
// thing being shown off
export const TRY_SENTENCES = [
  "El pingüino soñaba con el mar, pero hoy baila en la nieve.",
  "La niña guardó su cañón de papel junto al búho del jardín.",
  "Mañana compraré café, pan dulce y un cuaderno de música.",
];

// In English: short too, with capitals and a bit of punctuation
export const TRY_SENTENCES_EN = [
  "The quick brown fox jumps over the lazy dog by the river.",
  "Pack my box with five dozen jugs of liquid, then take a break.",
  "Jim quickly realized that the big fuzzy owls were waxing poetic.",
];

// The sentences for the language the page is in
export const trySentences = () =>
  locale.value === "en" ? TRY_SENTENCES_EN : TRY_SENTENCES;

// A letter needs this many slips before it's the story
const MIN_MISSES_TO_NAME = 2;
// A slow key has to be clearly slower than your middle one
const SLOW_FACTOR = 1.4;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const label = (char) =>
  char === " "
    ? t("landing.news.tryIt.space")
    : t("landing.news.tryIt.key", char.toUpperCase());
const capitalized = (text) => `${text[0].toUpperCase()}${text.slice(1)}`;

// strokes: every character typed, in order: { index, expected, typed, ms }
// with ms since the first one. Backspaces aren't strokes.
export const summarizeTry = ({ text, input, strokes }) => {
  const elapsedMs = strokes.length ? strokes[strokes.length - 1].ms : 0;
  const wrong = strokes.filter((s) => s.typed !== s.expected);
  const accuracy = strokes.length
    ? Math.round(((strokes.length - wrong.length) / strokes.length) * 100)
    : 100;

  // The key missed most, if it was missed more than once
  const misses = {};
  for (const stroke of wrong) {
    const key = stroke.expected.toLowerCase();
    misses[key] = (misses[key] || 0) + 1;
  }
  const [missedKey, missedTimes] =
    Object.entries(misses).sort((a, b) => b[1] - a[1])[0] ?? [];

  // The slowest letter: time from the previous right stroke to this right
  // one, adjacent in the text, so a fix or a pause to read isn't counted
  const gaps = [];
  for (let i = 1; i < strokes.length; i++) {
    const [previous, current] = [strokes[i - 1], strokes[i]];
    const bothRight =
      previous.typed === previous.expected && current.typed === current.expected;
    if (
      bothRight &&
      current.index === previous.index + 1 &&
      /\p{L}/u.test(current.expected)
    ) {
      gaps.push({ key: current.expected.toLowerCase(), ms: current.ms - previous.ms });
    }
  }
  const typical = gaps.length ? median(gaps.map((g) => g.ms)) : 0;
  const slowest = gaps.reduce((top, gap) => (!top || gap.ms > top.ms ? gap : top), null);

  let insight;
  if (missedKey && missedTimes >= MIN_MISSES_TO_NAME) {
    insight = {
      kind: "missed",
      text: t("landing.news.tryIt.missed", capitalized(label(missedKey)), missedTimes),
      detail: t("landing.news.tryIt.missedDetail"),
    };
  } else if (slowest && typical && slowest.ms >= typical * SLOW_FACTOR) {
    insight = {
      kind: "slow",
      text: t(
        "landing.news.tryIt.slow",
        label(slowest.key),
        Math.round(slowest.ms),
        Math.round(typical)
      ),
      detail: t("landing.news.tryIt.slowDetail"),
    };
  } else {
    insight = {
      kind: "clean",
      text: t(
        wrong.length ? "landing.news.tryIt.almostClean" : "landing.news.tryIt.clean"
      ),
      detail: t("landing.news.tryIt.cleanDetail"),
    };
  }

  return {
    wpm: elapsedMs ? computeWpm(input, text, elapsedMs) : 0,
    accuracy,
    seconds: Math.round(elapsedMs / 100) / 10,
    insight,
  };
};
