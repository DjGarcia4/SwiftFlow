import { describe, it, expect, afterEach } from "vitest";
import { t, locale, setLocale, registerMessages, guessLocale, catalogFor } from "./index";
import "./catalog";

registerMessages("test", {
  es: {
    hello: "Hola",
    greet: "Hola, {name}",
    errors: (n) => `${n} ${n === 1 ? "error" : "errores"}`,
    onlyEs: "Solo acá",
  },
  en: {
    hello: "Hello",
    greet: "Hi, {name}",
    errors: (n) => `${n} ${n === 1 ? "mistake" : "mistakes"}`,
  },
});

describe("t", () => {
  afterEach(() => setLocale("es"));

  it("reads the current language, with values and plurals", () => {
    setLocale("es");
    expect(t("test.greet", { name: "Ana" })).toBe("Hola, Ana");
    expect(t("test.errors", 1)).toBe("1 error");
    setLocale("en");
    expect(t("test.hello")).toBe("Hello");
    expect(t("test.errors", 3)).toBe("3 mistakes");
    expect(locale.value).toBe("en");
  });

  it("falls back to Spanish, then to the key itself", () => {
    setLocale("en");
    expect(t("test.onlyEs")).toBe("Solo acá");
    expect(t("test.nope")).toBe("test.nope");
  });

  it("ignores a language it doesn't have", () => {
    setLocale("fr");
    expect(locale.value).toBe("es");
  });
});

describe("guessLocale", () => {
  it("picks English for an English browser, Spanish otherwise", () => {
    expect(guessLocale(["en-GB"])).toBe("en");
    expect(guessLocale(["es-AR", "en"])).toBe("es");
    expect(guessLocale(["pt-BR"])).toBe("es");
    expect(guessLocale([])).toBe("es");
  });
});

// Every message the app has, in both languages, with the same shape
const shape = (node) =>
  typeof node === "function"
    ? "function"
    : typeof node === "string"
      ? "string"
      : Object.fromEntries(Object.entries(node).map(([k, v]) => [k, shape(v)]));

describe("catalogs", () => {
  it("have every message in English that there is in Spanish", () => {
    const { test: _es, ...es } = catalogFor("es");
    const { test: _en, ...en } = catalogFor("en");
    expect(shape(en)).toEqual(shape(es));
  });
});
