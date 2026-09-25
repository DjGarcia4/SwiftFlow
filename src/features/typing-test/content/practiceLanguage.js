// The language the practice texts come in, apart from the interface's:
// the app can be read in Spanish while practicing English, or the other way
// round. The config store sets it; the content banks read it the way t()
// reads the locale, so whatever draws a text follows a change on its own.
import { ref } from "vue";

export const PRACTICE_LANGUAGES = ["es", "en"];

export const isPracticeLanguage = (id) => PRACTICE_LANGUAGES.includes(id);

export const practiceLanguage = ref("es");

export const setPracticeLanguage = (id) => {
  practiceLanguage.value = isPracticeLanguage(id) ? id : "es";
};

// The bank for the language being practiced: inPracticeLanguage({ es, en })
export const inPracticeLanguage = (banks) => banks[practiceLanguage.value] ?? banks.es;

// The modes whose text comes in a language. Code, numbers and your own
// texts are the same whichever it is.
export const LANGUAGE_MODES = new Set([
  "time",
  "words",
  "quote",
  "classics",
  "dictation",
  "zen",
  "drill",
  "weekly",
  "lesson",
]);

// What a result stores about it: nothing for Spanish, which every result
// from before there was a choice was played in
export const resultLanguage = (mode, language = practiceLanguage.value) =>
  LANGUAGE_MODES.has(mode) && language !== "es" ? language : undefined;
