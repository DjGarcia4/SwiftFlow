// The app's languages. Every piece of interface text lives in a messages.js
// next to the feature that shows it, Spanish and English side by side, and
// is read with t("namespace.path"). A message can be a function, for
// plurals and anything else with grammar in it: t("typing.errors", 3).
// Anything missing in English falls back to the Spanish, which is always
// complete (a test checks the two catalogs have the same keys).
import { ref, watch } from "vue";

export const LOCALES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
];

const STORAGE_KEY = "swiftflow_locale";

const isLocale = (id) => LOCALES.some((locale) => locale.id === id);

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

// English for a browser in English; Spanish, the app's own, for the rest
export const guessLocale = (languages = []) =>
  languages.find(Boolean)?.toLowerCase().startsWith("en") ? "en" : "es";

export const locale = ref(
  readStored() ?? guessLocale(typeof navigator === "undefined" ? [] : navigator.languages)
);

export const setLocale = (id) => {
  if (!isLocale(id)) return;
  locale.value = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage blocked: it still holds for this visit
  }
};

if (typeof document !== "undefined") {
  watch(locale, (id) => (document.documentElement.lang = id), { immediate: true });
}

const catalogs = { es: {}, en: {} };

// A feature's messages, under its own namespace
export const registerMessages = (namespace, { es, en }) => {
  catalogs.es[namespace] = es;
  catalogs.en[namespace] = en;
};

export const catalogFor = (id) => catalogs[id];

const lookup = (catalog, path) =>
  path
    .split(".")
    .reduce((node, part) => (node == null ? undefined : node[part]), catalog);

// Reads locale.value, so a computed or a template that calls it follows a
// change of language on its own
export const t = (path, ...args) => {
  const entry = lookup(catalogs[locale.value], path) ?? lookup(catalogs.es, path);
  if (entry === undefined) {
    if (import.meta.env?.DEV) console.warn(`[i18n] Missing message: ${path}`);
    return path;
  }
  if (typeof entry === "function") return entry(...args);
  const [values] = args;
  if (values && typeof values === "object") {
    return entry.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }
  return entry;
};

// Numbers and dates the way the current language writes them
export const localeTag = () => (locale.value === "en" ? "en-US" : "es");
