// How the text to type looks: its font, size and line spacing, and whether
// the caret glides or jumps. Kept apart from the rewards (customization.js):
// these are about reading comfortably, so they're never locked.

// `load` pulls a font's files in the first time it's picked, so nobody
// downloads the ones they don't use. They're bundled rather than fetched
// from a font service, so they keep working offline.
export const TEXT_FONTS = [
  { id: "mono", label: "Monoespaciada", family: "var(--font-mono)" },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    family: '"JetBrains Mono", var(--font-mono)',
    load: () => import("@fontsource/jetbrains-mono/latin-400.css"),
  },
  { id: "nunito", label: "Nunito", family: "var(--font-sans)" },
  {
    id: "atkinson",
    label: "Atkinson Hyperlegible",
    family: '"Atkinson Hyperlegible", var(--font-sans)',
    load: () => import("@fontsource/atkinson-hyperlegible/latin-400.css"),
  },
  // The Mono cut: the packaged proportional one puts the ó's accent after
  // the letter
  {
    id: "opendyslexic",
    label: "OpenDyslexic",
    family: '"OpenDyslexic Mono", var(--font-mono)',
    load: () => import("@/assets/fonts/opendyslexic/opendyslexic.css"),
  },
];

// Font size of the text, on a phone and from sm up. "m" is how it's always
// been.
export const TEXT_SIZES = [
  { id: "s", label: "S", mobile: 20, desktop: 24 },
  { id: "m", label: "M", mobile: 24, desktop: 30 },
  { id: "l", label: "L", mobile: 28, desktop: 36 },
  { id: "xl", label: "XL", mobile: 32, desktop: 44 },
];

export const LINE_HEIGHTS = [
  { id: "tight", label: "Junto", value: 1.6 },
  { id: "normal", label: "Normal", value: 1.9 },
  { id: "loose", label: "Amplio", value: 2.3 },
];

export const CARET_MOTIONS = [
  { id: "smooth", label: "Se desliza" },
  { id: "instant", label: "Salta" },
];

// Focus mode: only the word being typed and the next one, big and alone
export const FOCUS_OPTIONS = [
  { id: "off", label: "No" },
  { id: "on", label: "Sí" },
];

export const TEXT_APPEARANCE_DEFAULTS = {
  font: "mono",
  size: "m",
  lineHeight: "normal",
  caretMotion: "smooth",
  focus: "off",
};

const OPTIONS = {
  font: TEXT_FONTS,
  size: TEXT_SIZES,
  lineHeight: LINE_HEIGHTS,
  caretMotion: CARET_MOTIONS,
  focus: FOCUS_OPTIONS,
};

const STORAGE_KEY = "swiftflow_text_appearance";

// Each field kept only if it's still an option; anything else is the default
export const sanitizeTextAppearance = (saved) =>
  Object.fromEntries(
    Object.entries(TEXT_APPEARANCE_DEFAULTS).map(([field, fallback]) => [
      field,
      OPTIONS[field].some((option) => option.id === saved?.[field])
        ? saved[field]
        : fallback,
    ])
  );

export const loadTextAppearance = () => {
  try {
    return sanitizeTextAppearance(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"));
  } catch {
    return { ...TEXT_APPEARANCE_DEFAULTS };
  }
};

export const saveTextAppearance = (appearance) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // Storage blocked: the choice still holds for this visit
  }
};

export const optionOf = (field, id) =>
  OPTIONS[field].find((option) => option.id === id) ?? OPTIONS[field][0];

// The inline style for text drawn with these settings. `wide` is sm and up.
export const textStyleFor = (appearance, { wide }) => {
  const size = optionOf("size", appearance.size);
  return {
    fontFamily: optionOf("font", appearance.font).family,
    fontSize: `${wide ? size.desktop : size.mobile}px`,
    lineHeight: optionOf("lineHeight", appearance.lineHeight).value,
  };
};
