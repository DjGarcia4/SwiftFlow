// Your own texts to practice: pasted in, named, kept on this device. They're
// typed exactly as written -- capitals, punctuation, line breaks -- so the
// only cleanup is what nobody can see or type on purpose.

export const MAX_CUSTOM_TEXTS = 20;
export const MAX_CUSTOM_TEXT_LENGTH = 5000;
export const MAX_CUSTOM_NAME_LENGTH = 40;
// Short enough to be over before it starts
export const MIN_CUSTOM_TEXT_LENGTH = 10;

// Pasted text brings things along that can't be typed as they look: tabs,
// Windows line endings, non-breaking spaces, trailing blanks, runs of empty
// lines. Straighten those out; leave everything else alone.
export const normalizeCustomText = (text) =>
  String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[   ]/g, " ")
    // Curly quotes and long dashes aren't on the keyboard
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CUSTOM_TEXT_LENGTH);

// What's wrong with a text about to be saved, in words for the form, or
// null when it's fine
export const validateCustomText = ({ name, text }) => {
  if (!String(name ?? "").trim()) return "Ponele un nombre.";
  if (normalizeCustomText(text).length < MIN_CUSTOM_TEXT_LENGTH) {
    return `El texto tiene que tener al menos ${MIN_CUSTOM_TEXT_LENGTH} caracteres.`;
  }
  return null;
};

export const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const STORAGE_KEY = "swiftflow_custom_texts";

// Anything stored that doesn't look like a text is dropped rather than
// trusted -- it's the one list here that's entirely user-supplied.
const isStoredText = (entry) =>
  entry &&
  typeof entry.id === "string" &&
  typeof entry.name === "string" &&
  typeof entry.text === "string" &&
  entry.text.length > 0;

export const loadCustomTexts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isStoredText).slice(0, MAX_CUSTOM_TEXTS)
      : [];
  } catch {
    return [];
  }
};

export const saveCustomTexts = (texts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(texts));
    return true;
  } catch {
    // Storage full: the caller says so instead of pretending it's saved
    return false;
  }
};
