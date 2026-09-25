// The weekly challenge: one text per week, the same for everyone. It's
// seeded from the week alone -- no server involved -- so anyone opening the
// app that week gets exactly these words, and a result can be compared
// with a friend's.
import { t } from "@/shared/i18n";

import { practiceWords } from "@/features/typing-test/content/words";
import { practiceLanguage } from "@/features/typing-test/content/practiceLanguage";
import { randomFrom } from "@/shared/utils/seededRandom";

export const WEEKLY_WORD_COUNT = 40;

// ISO 8601 week: weeks start on Monday, and week 1 is the one with the
// year's first Thursday -- so the last days of December can belong to next
// year's week 1, and the first days of January to last year's final week.
export const isoWeek = (date = new Date()) => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Thursday of this week decides which year the week belongs to
  day.setDate(day.getDate() + 3 - ((day.getDay() + 6) % 7));
  const year = day.getFullYear();
  const firstThursday = new Date(year, 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  const week = 1 + Math.round((day - firstThursday) / (7 * 24 * 60 * 60 * 1000));
  return { year, week };
};

// "2026-W39": what results are stored under
export const weeklyKey = (date = new Date()) => {
  const { year, week } = isoWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
};

// "S39·2026": what people read and share
export const weeklyLabel = (key) => {
  const [year, week] = key.split("-W");
  return t("history.weekLabel", Number(week), year);
};

export const generateWeeklyText = (key, count = WEEKLY_WORD_COUNT) => {
  // The same for everyone practicing the same language. Spanish keeps the
  // seed it had before there was a choice.
  const bank = practiceWords();
  const language = practiceLanguage.value;
  const random = randomFrom(
    language === "es" ? `weekly:${key}` : `weekly:${language}:${key}`
  );
  const words = [];
  let last = null;
  while (words.length < count) {
    const word = bank[Math.floor(random() * bank.length)];
    if (word === last) continue;
    words.push(word);
    last = word;
  }
  return words.join(" ");
};
