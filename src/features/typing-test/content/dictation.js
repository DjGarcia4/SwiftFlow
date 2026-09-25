// "Dictado": sentences read out loud, to be typed without seeing them. They
// come from the paragraphs bank, cut at their periods. A voice doesn't say
// commas or capitals, so neither is asked for -- but it does say "está" and
// "esta" differently, so the accents and the ñ stay: half the exercise is
// spelling what you hear.
import { paragraphs } from "./paragraphs";

export const DICTATION_SENTENCE_COUNTS = [1, 3, 5];

const MIN_WORDS = 6;
const MAX_WORDS = 16;

// "Desde los primeros telégrafos, la evolución..." -> "desde los primeros
// telégrafos la evolución"
export const toDictation = (sentence) =>
  sentence
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const dictationSentences = [
  ...new Set(
    paragraphs
      .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/))
      .filter((sentence) => {
        const words = sentence.split(/\s+/).length;
        return words >= MIN_WORDS && words <= MAX_WORDS;
      })
      .map(toDictation)
  ),
];

// `count` different sentences, joined into one text, with where each one
// starts in it
export const buildDictation = (count, random = Math.random) => {
  const pool = [...dictationSentences];
  const sentences = [];
  for (let i = 0; i < count && pool.length; i++) {
    sentences.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
  }
  const starts = [];
  let position = 0;
  for (const sentence of sentences) {
    starts.push(position);
    position += sentence.length + 1;
  }
  return { sentences, starts, text: sentences.join(" ") };
};

// Which sentence a position in the text falls in. The space after a
// sentence belongs to it: the next one is dictated once that one is done.
export const sentenceIndexAt = (starts, position) => {
  let index = 0;
  while (index + 1 < starts.length && starts[index + 1] <= position) index++;
  return index;
};
