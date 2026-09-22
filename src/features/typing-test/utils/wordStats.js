import { computeReplay } from "./replay";

// Per-word stats for one session, kept on its result: the words you
// stumble on, which letter-level stats can't see -- "desarrollo" going
// wrong isn't the same as its R going wrong everywhere.

// Shorter words say nothing about a word: "de" and "la" are just letters
export const MIN_WORD_LENGTH = 3;

// Case and the punctuation around a word don't make it a different word
export const normalizeWord = (word) =>
  word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

// { [word]: [times, errors, msSum, timedCount] } -- errors counts the
// times the word had any mistake in it, fixed with backspace or not; the
// time is per character, to compare words of any length.
export const sessionWordStats = ({ mode, text, input, samples, errorIndexes }) => {
  // Code's "words" are identifiers and operators: nothing to learn there
  if (mode === "code" || !input.length) return {};

  const missed = new Set(errorIndexes);
  const { segments } = computeReplay({ text, input, samples });
  const stats = {};

  for (const segment of segments) {
    if (segment.type !== "word") continue;
    const word = normalizeWord(segment.text);
    if ([...word].length < MIN_WORD_LENGTH) continue;
    // Only whole words: a last word the clock cut off halfway ("equ" of
    // "equipo") wasn't stumbled on. Whole means the text itself has a space
    // or its end right after it.
    const end = segment.start + segment.text.length;
    if (end < text.length && !/\s/.test(text[end])) continue;

    let hadError = false;
    for (let i = segment.start; i < segment.start + segment.text.length; i++) {
      if (missed.has(i)) hadError = true;
    }

    const entry = stats[word] ?? [0, 0, 0, 0];
    entry[0]++;
    if (hadError) entry[1]++;
    // The first word also carries finding the keyboard: no time for it
    if (segment.start > 0 && segment.msPerChar !== null) {
      entry[2] += Math.round(segment.msPerChar);
      entry[3]++;
    }
    stats[word] = entry;
  }
  return stats;
};
