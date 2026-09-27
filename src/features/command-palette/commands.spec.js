import { describe, it, expect, vi, afterEach } from "vitest";
import { buildCommands } from "./commands";
import { searchCommands, withRecentFirst, normalize } from "./search";
import { setLocale } from "@/shared/i18n";

const fakeConfig = (overrides = {}) => ({
  type: "time",
  times: [15, 30, 60, 120],
  words: [10, 25, 50, 100],
  languages: ["JavaScript", "Python"],
  selectedTime: 15,
  selectedWords: 25,
  selectedCodeLanguage: null,
  selectedContentTypes: "punctuation",
  dictationSentences: 3,
  customTexts: [],
  selectedCustomText: null,
  blindMode: false,
  raceMode: null,
  strictMode: null,
  minAccuracy: null,
  keyboardVisible: false,
  fingerColors: false,
  keyboardLayout: "latam",
  textLanguage: "es",
  startTime: null,
  isCompleted: false,
  handleType: vi.fn(function (type) {
    this.type = type;
  }),
  handleTime: vi.fn(),
  handleWords: vi.fn(),
  handleCodeLanguage: vi.fn(),
  handleContentTypes: vi.fn(),
  handleDictationSentences: vi.fn(),
  selectCustomText: vi.fn(),
  openCustomEditor: vi.fn(),
  toggleBlindMode: vi.fn(),
  toggleRaceMode: vi.fn(),
  setStrictMode: vi.fn(),
  setMinAccuracy: vi.fn(),
  toggleKeyboard: vi.fn(),
  toggleFingerColors: vi.fn(),
  setKeyboardLayout: vi.fn(),
  setTextLanguage: vi.fn(),
  endSession: vi.fn(),
  ...overrides,
});

const context = ({ config = fakeConfig(), routeName = "home" } = {}) => ({
  config,
  theme: { isDark: false, toggleTheme: vi.fn() },
  contrast: { high: false, setHigh: vi.fn() },
  sound: { soundEnabled: true, toggle: vi.fn() },
  appearance: {
    appearance: {
      font: "mono",
      size: "m",
      lineHeight: "normal",
      caretMotion: "smooth",
      focus: "off",
    },
    focusMode: false,
    set: vi.fn(),
  },
  palette: { requestRestart: vi.fn(), open: vi.fn() },
  router: { push: vi.fn() },
  route: { name: routeName },
  locale: "es",
  setLocale: vi.fn(),
  canSpeak: true,
});

const find = (ctx, query) => searchCommands(buildCommands(ctx), query)[0];

afterEach(() => setLocale("es"));

describe("searchCommands", () => {
  it("ignores accents and capitals", () => {
    expect(normalize("Tipografía ÑANDÚ")).toBe("tipografia nandu");
  });

  it("finds the time by its number alone", () => {
    const ctx = context();
    const command = find(ctx, "30");
    expect(command.id).toBe("time:30");
    command.run();
    expect(ctx.config.handleTime).toHaveBeenCalledWith(30);
  });

  it("finds words by a few letters and a number", () => {
    const ctx = context();
    const command = find(ctx, "pal 50");
    expect(command.id).toBe("words:50");
    command.run();
    expect(ctx.config.handleType).toHaveBeenCalledWith("words");
    expect(ctx.config.handleWords).toHaveBeenCalledWith(50);
  });

  it("wants every word typed to fit", () => {
    expect(searchCommands(buildCommands(context()), "tiempo 45")).toEqual([]);
  });

  it("answers in both languages, whichever the app is in", () => {
    expect(find(context(), "dark").id).toBe("appearance:theme");
    expect(find(context(), "oscuro").id).toBe("appearance:theme");
    setLocale("en");
    expect(find(context(), "tiempo 60").id).toBe("time:60");
    expect(find(context(), "time 60").label).toBe("60 s");
  });

  it("goes to the test from another page when changing it", () => {
    const ctx = context({ routeName: "history" });
    find(ctx, "15").run();
    expect(ctx.router.push).toHaveBeenCalledWith("/");
  });

  it("puts the ones used last on top", () => {
    const commands = buildCommands(context());
    const ordered = withRecentFirst(commands, ["layout:dvorak", "gone", "time:60"]);
    expect(ordered.slice(0, 2).map((c) => c.id)).toEqual(["layout:dvorak", "time:60"]);
    expect(ordered).toHaveLength(commands.length);
  });
});

describe("buildCommands", () => {
  const ids = (ctx) => buildCommands(ctx).map((command) => command.id);

  it("marks what's already on", () => {
    const commands = buildCommands(context());
    expect(commands.find((c) => c.id === "time:15").active).toBe(true);
    expect(commands.find((c) => c.id === "time:30").active).toBe(false);
    expect(commands.find((c) => c.id === "option:punctuation").active).toBe(true);
  });

  it("offers starting over and ending only on the test, during a run", () => {
    expect(ids(context())).toContain("action:restart");
    expect(ids(context())).not.toContain("action:finish");
    expect(ids(context({ config: fakeConfig({ startTime: 1 }) }))).toContain(
      "action:finish"
    );
    expect(ids(context({ routeName: "history" }))).not.toContain("action:restart");
  });

  it("offers each mode's own setting only in that mode", () => {
    expect(ids(context())).not.toContain("sentences:3");
    expect(ids(context({ config: fakeConfig({ type: "dictation" }) }))).toContain(
      "sentences:3"
    );
    expect(ids(context({ config: fakeConfig({ type: "numbers" }) }))).toContain(
      "count:50"
    );
    // Code is typed as written
    expect(ids(context({ config: fakeConfig({ type: "code" }) }))).not.toContain(
      "option:punctuation"
    );
  });

  it("leaves out dictation without a voice, and the page you're on", () => {
    const ctx = { ...context(), canSpeak: false };
    expect(ids(ctx)).not.toContain("mode:dictation");
    expect(ids(context())).not.toContain("go:test");
    expect(ids(context({ routeName: "history" }))).not.toContain("go:history");
  });

  it("doesn't turn off the code language already picked", () => {
    const ctx = context({
      config: fakeConfig({ type: "code", selectedCodeLanguage: "Python" }),
    });
    find(ctx, "codigo python").run();
    expect(ctx.config.handleCodeLanguage).not.toHaveBeenCalled();
    find(ctx, "codigo javascript").run();
    expect(ctx.config.handleCodeLanguage).toHaveBeenCalledWith("JavaScript");
  });

  it("changes the look, the keyboard and the language", () => {
    const ctx = context();
    find(ctx, "dvorak").run();
    expect(ctx.config.setKeyboardLayout).toHaveBeenCalledWith("dvorak");
    find(ctx, "opendyslexic").run();
    expect(ctx.appearance.set).toHaveBeenCalledWith("font", "opendyslexic");
    find(ctx, "idioma english").run();
    expect(ctx.setLocale).toHaveBeenCalledWith("en");
    find(ctx, "historial").run();
    expect(ctx.router.push).toHaveBeenCalledWith("/historial");
  });

  it("has an id of its own for every command", () => {
    const all = ids(
      context({
        config: fakeConfig({
          type: "dictation",
          strictMode: "sudden-death",
          minAccuracy: 95,
          customTexts: [{ id: "a", name: "Mail", text: "hola" }],
        }),
      })
    );
    expect(new Set(all).size).toBe(all.length);
  });
});
