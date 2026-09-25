// What each lesson has you type. Only keys already taught ever show up, and
// the lesson's own keys the most: at first as short groups ("fjf jjf"),
// and as soon as there are letters enough for it, as real words of the
// language being practiced.
import { practiceWords } from "@/features/typing-test/content/words";
import { englishAccentedWords } from "@/features/typing-test/content/en/words";
import { punctuateWords } from "@/features/typing-test/content/punctuate";
import { practiceParagraphs } from "@/features/typing-test/content/paragraphs";
import { inPracticeLanguage } from "@/features/typing-test/content/practiceLanguage";
import { knownKeys, lessonKeys } from "./course";

export const LESSON_GROUPS = 20;

// Words enough to make a text of: below this, drilled groups instead
const MIN_WORDS = 6;
const COMMA_CHANCE = 0.2;
const PERIOD_EVERY = 6;

const pick = (random, items) => items[Math.floor(random() * items.length)];

const hasAccent = (word) => /[áéíóúü]/.test(word);

// A group of 3 to 5 keys that keeps coming back to the lesson's own,
// taking turns with the ones already known ("fjfj", "xaxe"), and never
// the same key three times running
const drillGroup = (random, fresh, known) => {
  const length = 3 + Math.floor(random() * 3);
  const everything = [...new Set([...fresh, ...known])];
  let group = "";
  for (let i = 0; i < length; i++) {
    const pool = i % 2 === 0 || !known.length ? fresh : random() < 0.5 ? fresh : known;
    let key = pick(random, pool);
    if (group.at(-1) === key && group.at(-2) === key) {
      const others = everything.filter((other) => other !== key);
      if (others.length) key = pick(random, others);
    }
    group += key;
  }
  return group;
};

// Groups one after another, never the same twice in a row
const sequence = (count, next) => {
  const out = [];
  while (out.length < count) {
    const group = next();
    if (group !== out.at(-1)) out.push(group);
  }
  return out;
};

const lettersOnly = (keys) => keys.filter((key) => /^\p{L}$/u.test(key));

// Words written only with these letters (plain ones: accents come later)
const wordsWith = (letters) => {
  const allowed = new Set(letters);
  return practiceWords().filter(
    (word) => !hasAccent(word) && [...word].every((char) => allowed.has(char))
  );
};

// The comma and the period, once they've been taught, dropped into the text
const withSigns = (groups, random, keys) => {
  const comma = keys.includes(",");
  const period = keys.includes(".");
  return groups.map((group, i) => {
    if (period && (i + 1) % PERIOD_EVERY === 0) return `${group}.`;
    if (comma && i < groups.length - 1 && random() < COMMA_CHANCE) return `${group},`;
    return group;
  });
};

const keysText = (lesson, layout, random) => {
  const all = knownKeys(lesson, layout);
  const fresh = lessonKeys(lesson, layout);
  const freshLetters = lettersOnly(lesson.review ? all : fresh);
  const knownLetters = lettersOnly(all);
  const words = wordsWith(knownLetters);
  const aimed = words.filter((word) => freshLetters.some((key) => word.includes(key)));

  let groups;
  if (words.length >= MIN_WORDS) {
    // Words with the new keys first, words with the old ones, and drilled
    // groups to press the new keys harder -- more of those when few words
    // have them (an x, early on)
    const aimedShare = aimed.length >= MIN_WORDS ? 0.6 : aimed.length ? 0.4 : 0;
    groups = sequence(LESSON_GROUPS, () => {
      const roll = random();
      if (roll < aimedShare) return pick(random, aimed);
      if (roll < aimedShare + 0.25) return pick(random, words);
      return drillGroup(random, freshLetters, knownLetters);
    });
  } else {
    const others = knownLetters.filter((key) => !freshLetters.includes(key));
    groups = sequence(LESSON_GROUPS, () => drillGroup(random, freshLetters, others));
  }
  return withSigns(groups, random, all).join(" ");
};

const plainWords = () => practiceWords().filter((word) => !hasAccent(word));
// English has few: the ones it borrowed with their accents on
const accentedWords = () =>
  inPracticeLanguage({
    es: practiceWords().filter(hasAccent),
    en: englishAccentedWords,
  });

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Numbers from the lesson's digits, and the ones taught before them
const numbersText = (lesson, random) => {
  const digits = lesson.id === "numbers-right" ? [..."1234567890"] : lessonKeys(lesson);
  return sequence(LESSON_GROUPS, () => {
    const length = 1 + Math.floor(random() * 4);
    let number = "";
    for (let i = 0; i < length; i++) number += pick(random, digits);
    return number;
  }).join(" ");
};

// Real text from the paragraphs bank, a few sentences' worth
const finalText = (random) => {
  const sentences = practiceParagraphs()
    .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/))
    .filter((sentence) => {
      const words = sentence.split(" ").length;
      return words >= 8 && words <= 16;
    });
  const out = [];
  while (out.join(" ").split(" ").length < 40) out.push(pick(random, sentences));
  return out.join(" ");
};

export const generateLessonText = (lesson, layout, random = Math.random) => {
  switch (lesson.kind) {
    case "keys":
      return keysText(lesson, layout, random);
    case "shift":
      // Half the words capitalized, so Shift comes up constantly
      return sequence(LESSON_GROUPS, () => {
        const word = pick(random, plainWords());
        return random() < 0.5 ? capitalize(word) : word;
      }).join(" ");
    case "accents":
      return sequence(LESSON_GROUPS, () =>
        random() < 0.7 ? pick(random, accentedWords()) : pick(random, plainWords())
      ).join(" ");
    case "numbers":
      return numbersText(lesson, random);
    case "signs":
      return punctuateWords(
        sequence(LESSON_GROUPS, () => pick(random, practiceWords())).join(" "),
        random
      );
    default:
      return finalText(random);
  }
};
