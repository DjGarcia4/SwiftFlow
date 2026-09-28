// Everything the palette can do, built fresh from the app's state each time
// it's shown -- so the list only offers what makes sense right now (the
// dictation's sentence count only in dictation, "end the run" only during
// one) and marks what's already on.
//
// A command: { id, group, label, keywords, run, active?, keepOpen? }.
// `group` and `label` are what's shown; `keywords` are more words it answers
// to. The group and label are also searched in the other language, so
// "tiempo" finds the time options with the app in English.
import { t, catalogFor, LOCALES } from "@/shared/i18n";
import { hotkeyLabel } from "@/features/command-palette/hotkeys";
import { LESSONS, lessonIndex, lessonTitle } from "@/features/course/course";
import { KEYBOARD_LAYOUTS } from "@/features/typing-test/utils/keyboardLayouts";
import { PRACTICE_LANGUAGES } from "@/features/typing-test/content/practiceLanguage";
import { DICTATION_SENTENCE_COUNTS } from "@/features/typing-test/content/dictation";
import {
  STRICT_MODES,
  MIN_ACCURACY_OPTIONS,
} from "@/features/typing-test/utils/strictModes";
import {
  TEXT_FONTS,
  TEXT_SIZES,
  LINE_HEIGHTS,
  CARET_MOTIONS,
} from "@/shared/utils/textAppearance";

const lookup = (catalog, path) =>
  path
    .split(".")
    .reduce((node, part) => (node == null ? undefined : node[part]), catalog);

// A message in every language, for searching: "Tiempo" and "Time"
const inEveryLanguage = (path, ...args) =>
  LOCALES.map(({ id }) => {
    const entry = lookup(catalogFor(id), path);
    return typeof entry === "function" ? entry(...args) : entry;
  }).filter((text) => typeof text === "string");

const words = (path) => inEveryLanguage(path).join(" ").split(/\s+/);

// The modes offered from the bar. The weekly challenge and the course are
// started from their own places.
const PLAYABLE_MODES = [
  "time",
  "words",
  "numbers",
  "quote",
  "classics",
  "dictation",
  "code",
  "zen",
  "drill",
  "custom",
];

// Modes where punctuation is a choice (same as the bar)
const NO_PUNCTUATION_CHOICE = ["code", "weekly", "custom", "dictation", "lesson"];

const PAGES = [
  { id: "test", path: "/", name: "home" },
  { id: "history", path: "/historial", name: "history" },
  { id: "course", path: "/curso", name: "course" },
  { id: "summary", path: "/resumen", name: "summary" },
  { id: "about", path: "/sobre", name: "about" },
];

// ctx: { config, theme, contrast, sound, appearance, palette, router,
// route, locale, setLocale, canSpeak, hotkeys, course }. `course` is the
// course's progress (courseProgress in course.js). `hotkeys` are the buttons
// on screen with a key of their own ({ id, hotkey }, see hotkeys.js).
export const buildCommands = (ctx) => {
  const {
    config,
    theme,
    contrast,
    sound,
    appearance,
    palette,
    router,
    route,
    locale,
    setLocale,
    canSpeak = true,
    hotkeys = [],
    course = null,
  } = ctx;

  const onTest = route?.name === "home";
  const commands = [];

  const group = (id) => t(`palette.groups.${id}`);
  const add = (command, { groupId, labelPath, extra = [] } = {}) => {
    commands.push({
      ...command,
      keywords: [
        ...(groupId ? inEveryLanguage(`palette.groups.${groupId}`) : []),
        ...(labelPath ? inEveryLanguage(labelPath) : []),
        ...extra,
      ],
    });
  };

  // Anything about the test takes you to it, from wherever you are
  const onTheTest = (change) => () => {
    change();
    if (!onTest) router.push("/");
  };

  const setMode = (mode) => {
    if (config.type !== mode) config.handleType(mode);
  };

  // What you're most likely after comes first: during a run, starting
  // over; the time and word counts, then the modes
  if (onTest) {
    add(
      {
        id: "action:restart",
        group: group("action"),
        label: t("palette.commands.restart"),
        hotkey: "restart",
        run: () => palette.requestRestart(),
      },
      { labelPath: "palette.commands.restart", extra: words("palette.keywords.restart") }
    );
    if (config.startTime && !config.isCompleted) {
      add(
        {
          id: "action:finish",
          group: group("action"),
          label: t("palette.commands.finish"),
          run: () => config.endSession(),
        },
        { labelPath: "palette.commands.finish", extra: words("palette.keywords.finish") }
      );
    }
  }

  // What the buttons on screen do, with the key that presses each one
  for (const { id, hotkey } of hotkeys) {
    const label = hotkeyLabel(hotkey);
    add(
      {
        id: `hotkey:${id}`,
        group: group("here"),
        label,
        hotkey: id,
        run: hotkey.run,
      },
      { groupId: "here", extra: label.split(/\s+/) }
    );
  }

  // The day's challenges, from anywhere: they live on the test
  add(
    {
      id: "challenges:open",
      group: group("challenges"),
      label: t("palette.commands.challenges"),
      hotkey: "challenges",
      run: () => {
        palette.requestChallenges();
        if (!onTest) router.push("/");
      },
    },
    {
      labelPath: "palette.commands.challenges",
      extra: words("palette.keywords.challenges"),
    }
  );
  add(
    {
      id: "challenges:weekly",
      group: group("challenges"),
      label: t("palette.commands.weekly"),
      active: config.type === "weekly",
      run: onTheTest(() => setMode("weekly")),
    },
    { labelPath: "palette.commands.weekly", extra: words("palette.keywords.weekly") }
  );
  add(
    {
      id: "challenges:achievements",
      group: group("challenges"),
      label: t("palette.commands.achievements"),
      run: () => router.push({ path: "/historial", hash: "#logros" }),
    },
    {
      labelPath: "palette.commands.achievements",
      extra: words("palette.keywords.achievements"),
    }
  );

  // The course: on to the next lesson, or any one already open
  if (course) {
    const lessonNumber = (lesson) => lessonIndex(lesson.id) + 1;
    add(
      {
        id: "course:continue",
        group: group("course"),
        label: t("palette.commands.continueCourse", lessonNumber(course.next)),
        hotkey: "continueCourse",
        run: onTheTest(() => config.startLesson(course.next.id)),
      },
      { groupId: "course", extra: words("palette.keywords.course") }
    );
    for (const lesson of LESSONS) {
      if (!course.unlocked[lesson.id]) continue;
      add(
        {
          id: `course:lesson:${lesson.id}`,
          group: group("course"),
          label: t(
            "palette.commands.lesson",
            lessonNumber(lesson),
            lessonTitle(lesson, config.keyboardLayout)
          ),
          active: config.type === "lesson" && config.lessonId === lesson.id,
          run: onTheTest(() => config.startLesson(lesson.id)),
        },
        { groupId: "course", extra: [`${lessonNumber(lesson)}`] }
      );
    }
  }

  for (const seconds of config.times) {
    add(
      {
        id: `time:${seconds}`,
        group: group("time"),
        label: `${seconds} s`,
        active: config.type === "time" && config.selectedTime === seconds,
        run: onTheTest(() => {
          setMode("time");
          config.handleTime(seconds);
        }),
      },
      { groupId: "time", extra: ["seg", "segundos", "seconds", "sec"] }
    );
  }

  for (const count of config.words) {
    add(
      {
        id: `words:${count}`,
        group: group("words"),
        label: `${count}`,
        active: config.type === "words" && config.selectedWords === count,
        run: onTheTest(() => {
          setMode("words");
          config.handleWords(count);
        }),
      },
      { groupId: "words" }
    );
  }

  // Numbers and the drill count their own way, from the same options
  if (config.type === "numbers" || config.type === "drill") {
    for (const count of config.words) {
      add(
        {
          id: `count:${count}`,
          group: `${group("count")} · ${t(`shared.modes.${config.type}`)}`,
          label: `${count}`,
          active: config.selectedWords === count,
          run: onTheTest(() => config.handleWords(count)),
        },
        { groupId: "count" }
      );
    }
  }

  for (const mode of PLAYABLE_MODES) {
    if (mode === "dictation" && !canSpeak) continue;
    add(
      {
        id: `mode:${mode}`,
        group: group("mode"),
        label: t(`shared.modes.${mode}`),
        active: config.type === mode,
        run: onTheTest(() => setMode(mode)),
      },
      { groupId: "mode", labelPath: `shared.modes.${mode}` }
    );
  }

  if (config.type === "dictation") {
    for (const count of DICTATION_SENTENCE_COUNTS) {
      add(
        {
          id: `sentences:${count}`,
          group: group("sentences"),
          label: t("typing.toolbar.sentenceCount", count),
          active: config.dictationSentences === count,
          run: onTheTest(() => config.handleDictationSentences(count)),
        },
        { groupId: "sentences" }
      );
    }
  }

  // Code, in one language or all of them
  for (const language of [null, ...config.languages]) {
    add(
      {
        id: `code:${language ?? "all"}`,
        group: group("code"),
        label: language ?? t("typing.toolbar.allLanguages"),
        active: config.type === "code" && config.selectedCodeLanguage === language,
        run: onTheTest(() => {
          setMode("code");
          if (config.selectedCodeLanguage !== language) {
            config.handleCodeLanguage(language);
          }
        }),
      },
      {
        groupId: "code",
        labelPath: language ? undefined : "typing.toolbar.allLanguages",
        extra: ["code", "codigo", "programar"],
      }
    );
  }

  // Your own texts, each by its name, and a new one
  for (const text of config.customTexts) {
    add(
      {
        id: `custom:${text.id}`,
        group: t("shared.modes.custom"),
        label: text.name,
        active: config.type === "custom" && config.selectedCustomText?.id === text.id,
        run: onTheTest(() => {
          setMode("custom");
          config.selectCustomText(text.id);
        }),
      },
      { labelPath: "shared.modes.custom" }
    );
  }
  add(
    {
      id: "custom:new",
      group: t("shared.modes.custom"),
      label: t("palette.commands.newText"),
      run: onTheTest(() => config.openCustomEditor()),
    },
    { labelPath: "shared.modes.custom" }
  );

  // How the run is played
  if (!NO_PUNCTUATION_CHOICE.includes(config.type)) {
    add(
      {
        id: "option:punctuation",
        group: group("options"),
        label: t("palette.commands.punctuation"),
        active: config.selectedContentTypes === "punctuation",
        run: onTheTest(() => config.handleContentTypes("punctuation")),
      },
      { labelPath: "palette.commands.punctuation" }
    );
  }
  add(
    {
      id: "option:blind",
      group: group("options"),
      label: t("palette.commands.blind"),
      active: config.blindMode,
      run: onTheTest(() => config.toggleBlindMode()),
    },
    { labelPath: "palette.commands.blind" }
  );
  add(
    {
      id: "option:pacer",
      group: group("options"),
      label: t("palette.commands.pacer"),
      active: config.raceMode === "pacer",
      run: onTheTest(() => config.toggleRaceMode("pacer")),
    },
    { labelPath: "palette.commands.pacer", extra: ["ritmo", "pace", "wpm"] }
  );

  for (const mode of STRICT_MODES) {
    const key = mode.id === "sudden-death" ? "suddenDeath" : "mustCorrect";
    add(
      {
        id: `strict:${mode.id}`,
        group: group("strict"),
        label: t(`palette.commands.${key}`),
        active: config.strictMode === mode.id,
        run: onTheTest(() => config.setStrictMode(mode.id)),
      },
      { groupId: "strict", labelPath: `palette.commands.${key}` }
    );
  }
  if (config.strictMode) {
    add(
      {
        id: "strict:off",
        group: group("strict"),
        label: t("palette.commands.strictOff"),
        run: onTheTest(() => config.setStrictMode(null)),
      },
      { groupId: "strict", labelPath: "palette.commands.strictOff" }
    );
  }
  for (const min of MIN_ACCURACY_OPTIONS) {
    add(
      {
        id: `min-accuracy:${min}`,
        group: group("minAccuracy"),
        label: `${min} %`,
        active: config.minAccuracy === min,
        run: onTheTest(() => config.setMinAccuracy(min)),
      },
      { groupId: "minAccuracy", extra: ["precision", "accuracy"] }
    );
  }
  if (config.minAccuracy) {
    add(
      {
        id: "min-accuracy:off",
        group: group("minAccuracy"),
        label: t("palette.commands.minAccuracyOff"),
        run: onTheTest(() => config.setMinAccuracy(null)),
      },
      { groupId: "minAccuracy", labelPath: "palette.commands.minAccuracyOff" }
    );
  }

  // The keyboard
  const keyboardShown = config.keyboardVisible;
  add(
    {
      id: "keyboard:toggle",
      group: group("keyboard"),
      label: t(`palette.commands.${keyboardShown ? "hideKeyboard" : "showKeyboard"}`),
      hotkey: "keyboard",
      run: onTheTest(() => config.toggleKeyboard()),
    },
    { groupId: "keyboard", extra: words("palette.keywords.keyboard") }
  );
  add(
    {
      id: "keyboard:fingers",
      group: group("keyboard"),
      label: t("palette.commands.fingerColors"),
      active: config.fingerColors,
      run: onTheTest(() => config.toggleFingerColors()),
    },
    { groupId: "keyboard", labelPath: "palette.commands.fingerColors" }
  );
  for (const layout of KEYBOARD_LAYOUTS) {
    add(
      {
        id: `layout:${layout.id}`,
        group: group("layout"),
        label: t(`typing.keyboard.layouts.${layout.id}`),
        active: config.keyboardLayout === layout.id,
        run: () => config.setKeyboardLayout(layout.id),
      },
      {
        groupId: "layout",
        labelPath: `typing.keyboard.layouts.${layout.id}`,
        extra: words("palette.keywords.keyboard"),
      }
    );
  }

  // Languages: the texts', and the app's
  const languageName = (id) => LOCALES.find((entry) => entry.id === id)?.label ?? id;
  for (const id of PRACTICE_LANGUAGES) {
    add(
      {
        id: `practice-language:${id}`,
        group: group("practiceLanguage"),
        label: languageName(id),
        active: config.textLanguage === id,
        run: onTheTest(() => config.setTextLanguage(id)),
      },
      {
        groupId: "practiceLanguage",
        extra: [
          ...inEveryLanguage("shared.practiceLanguage"),
          id === "es" ? "espanol spanish" : "ingles english",
        ],
      }
    );
  }
  for (const { id, label } of LOCALES) {
    add(
      {
        id: `locale:${id}`,
        group: group("language"),
        label,
        active: locale === id,
        run: () => setLocale(id),
      },
      {
        groupId: "language",
        extra: [
          ...words("palette.keywords.language"),
          id === "es" ? "espanol spanish" : "ingles english",
        ],
      }
    );
  }

  // How the text looks
  for (const font of TEXT_FONTS) {
    add(
      {
        id: `font:${font.id}`,
        group: group("font"),
        label: font.label,
        active: appearance.appearance.font === font.id,
        run: () => appearance.set("font", font.id),
      },
      { groupId: "font", extra: ["letra", "tipografia", "typeface"] }
    );
  }
  for (const size of TEXT_SIZES) {
    add(
      {
        id: `size:${size.id}`,
        group: group("size"),
        label: size.label,
        active: appearance.appearance.size === size.id,
        run: () => appearance.set("size", size.id),
      },
      { groupId: "size", extra: ["letra", "grande", "chico", "big", "small"] }
    );
  }
  for (const option of LINE_HEIGHTS) {
    add(
      {
        id: `line-height:${option.id}`,
        group: group("lineHeight"),
        label: option.label,
        active: appearance.appearance.lineHeight === option.id,
        run: () => appearance.set("lineHeight", option.id),
      },
      {
        groupId: "lineHeight",
        labelPath: `typing.appearance.lineHeights.${option.id}`,
      }
    );
  }
  for (const option of CARET_MOTIONS) {
    add(
      {
        id: `caret:${option.id}`,
        group: group("caret"),
        label: option.label,
        active: appearance.appearance.caretMotion === option.id,
        run: () => appearance.set("caretMotion", option.id),
      },
      {
        groupId: "caret",
        labelPath: `typing.appearance.caretMotions.${option.id}`,
        extra: ["caret", "cursor"],
      }
    );
  }
  add(
    {
      id: "appearance:focus",
      group: group("appearance"),
      label: t("palette.commands.focus"),
      active: appearance.focusMode,
      run: () => appearance.set("focus", appearance.focusMode ? "off" : "on"),
    },
    { labelPath: "palette.commands.focus", extra: ["zona", "zone"] }
  );
  add(
    {
      id: "appearance:theme",
      group: group("appearance"),
      label: t(`palette.commands.${theme.isDark ? "lightTheme" : "darkTheme"}`),
      hotkey: "theme",
      run: () => theme.toggleTheme(),
    },
    { extra: words("palette.keywords.theme") }
  );
  add(
    {
      id: "appearance:contrast",
      group: group("appearance"),
      label: t("palette.commands.contrast"),
      active: contrast.high,
      run: () => contrast.setHigh(!contrast.high),
    },
    { labelPath: "palette.commands.contrast", extra: ["contrast"] }
  );
  add(
    {
      id: "sound:toggle",
      group: group("sound"),
      label: t(`palette.commands.${sound.soundEnabled ? "soundOff" : "soundOn"}`),
      run: () => sound.toggle("soundEnabled"),
    },
    { groupId: "sound", extra: words("palette.keywords.sound") }
  );

  // Pages
  for (const page of PAGES) {
    if (route?.name === page.name) continue;
    add(
      {
        id: `go:${page.id}`,
        group: group("go"),
        label: t(`palette.commands.${page.id}`),
        hotkey: `go:${page.id}`,
        run: () => router.push(page.path),
      },
      { groupId: "go", labelPath: `palette.commands.${page.id}` }
    );
  }

  add(
    {
      id: "help:shortcuts",
      group: group("action"),
      label: t("palette.commands.shortcuts"),
      keepOpen: true,
      run: () => palette.open("shortcuts"),
    },
    {
      labelPath: "palette.commands.shortcuts",
      extra: words("palette.keywords.shortcuts"),
    }
  );

  return commands;
};
