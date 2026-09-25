// Turns a run of loose words into sentences, the way the language being
// practiced writes them: a capital to start, commas along the way, and
// questions and exclamations -- opened as well as closed in Spanish
// (¿...? ¡...!), only closed in English. With "Puntuación" off, the text
// formatter strips all of it back to the loose words, so the words mode
// always builds its text this way.
import { inPracticeLanguage } from "./practiceLanguage";

const SENTENCE_MIN = 4;
const SENTENCE_MAX = 10;
const COMMA_CHANCE = 0.12;
// Of the sentences: most statements, the rest questions and exclamations
const QUESTION_CHANCE = 0.15;
const EXCLAMATION_CHANCE = 0.12;

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// `random` returns [0, 1), like Math.random; seededRandom's generators fit
export const punctuateWords = (text, random = Math.random) => {
  const words = text.split(" ").filter(Boolean);
  const [openQuestion, openExclamation] = inPracticeLanguage({
    es: ["¿", "¡"],
    en: ["", ""],
  });
  const out = [];
  let i = 0;
  while (i < words.length) {
    const length =
      SENTENCE_MIN + Math.floor(random() * (SENTENCE_MAX - SENTENCE_MIN + 1));
    const sentence = words.slice(i, i + length);
    i += sentence.length;

    const kind = random();
    const [open, close] =
      kind < QUESTION_CHANCE
        ? [openQuestion, "?"]
        : kind < QUESTION_CHANCE + EXCLAMATION_CHANCE
          ? [openExclamation, "!"]
          : ["", "."];

    sentence[0] = open + capitalize(sentence[0]);
    for (let j = 0; j < sentence.length - 1; j++) {
      // Never a comma right after the opening word of a question or
      // exclamation: "¿Dónde, está" reads wrong
      if (j > 0 && random() < COMMA_CHANCE) sentence[j] += ",";
    }
    sentence[sentence.length - 1] += close;
    out.push(...sentence);
  }
  return out.join(" ");
};
