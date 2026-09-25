// What's new, newest first, for the landing's "Novedades". Add an entry
// at the top when something ships (its words go in messages/news.js, under
// the same id); the page shows the latest few. `date` is the month it
// shipped, as "YYYY-MM".
import { t, localeTag } from "@/shared/i18n";

export const CHANGELOG = [
  { id: "practiceEnglish", date: "2026-09" },
  { id: "english", date: "2026-09" },
  { id: "summary", date: "2026-09" },
  { id: "consistency", date: "2026-09" },
  { id: "keyTrends", date: "2026-09" },
  { id: "course", date: "2026-09" },
  { id: "dictation", date: "2026-09" },
  { id: "classics", date: "2026-09" },
  { id: "focus", date: "2026-09" },
  { id: "strict", date: "2026-09" },
  { id: "accessibility", date: "2026-09" },
  { id: "textAppearance", date: "2026-09" },
  { id: "layouts", date: "2026-09" },
  { id: "landing", date: "2026-09" },
  { id: "rewards", date: "2026-09" },
  { id: "streakReminder", date: "2026-09" },
  { id: "fingerColors", date: "2026-09" },
  { id: "problemWords", date: "2026-09" },
  { id: "customText", date: "2026-09" },
  { id: "blind", date: "2026-09" },
  { id: "pacer", date: "2026-09" },
].map((entry) => ({
  ...entry,
  get title() {
    return t(`landing.news.changelog.entries.${entry.id}.title`);
  },
  get text() {
    return t(`landing.news.changelog.entries.${entry.id}.text`);
  },
}));

// "septiembre de 2026", "September 2026"
export const formatChangelogDate = (date) => {
  const [year, month] = date.split("-").map(Number);
  return t(
    "landing.news.changelog.date",
    new Date(year, month - 1, 1).toLocaleDateString(localeTag(), { month: "long" }),
    year
  );
};
