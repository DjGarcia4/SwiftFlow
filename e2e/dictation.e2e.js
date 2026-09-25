import { test, expect } from "@playwright/test";
import { openTest, openSettings, closeSettings, choose, restartHint } from "./helpers";

// A stand-in voice: what would have been said is kept to check
const fakeSpeech = (voices) => {
  window.__spoken = [];
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      getVoices: () => voices,
      speak: (utterance) => window.__spoken.push(utterance.text),
      cancel: () => {},
      addEventListener: () => {},
    },
  });
};

const spoken = (page) => page.evaluate(() => window.__spoken);

const startDictation = async (page) => {
  await openTest(page);
  await openSettings(page);
  await choose(page, "Modo", "Dictado");
  await choose(page, "Frases", "3 frases");
  await closeSettings(page);
};

test("dictates each sentence as the one before it is typed", async ({ page }) => {
  await page.addInitScript(fakeSpeech, [
    { lang: "es-AR", name: "Voz", localService: true },
  ]);
  await startDictation(page);
  const shown = async () =>
    (await page.locator("[data-char-index]").allTextContents()).join("");

  // The text is there to be typed, not read
  await expect(page.locator(".dictation-slot").first()).toBeVisible();
  await expect(page.locator(".dictation-slot").first()).toHaveCSS(
    "color",
    "rgba(0, 0, 0, 0)"
  );

  await page.getByRole("button", { name: /Escuchar/ }).click();
  const [first] = await spoken(page);
  expect(first.split(" ").length).toBeGreaterThanOrEqual(6);
  // Only the sentence being dictated has its blanks on screen
  expect(await shown(page)).toBe(`${first} `);

  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.type(`${first} `);
  await expect.poll(async () => (await spoken(page)).length).toBe(2);
  const second = (await spoken(page))[1];
  expect(await shown(page)).toBe(`${first} ${second} `);

  // Enter says it again, and types nothing
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await spoken(page)).length).toBe(3);
  expect((await spoken(page))[2]).toBe(second);
  await expect(field).toHaveValue(`${first} `);

  await page.keyboard.type(`${second} `);
  await expect.poll(async () => (await spoken(page)).length).toBe(4);
  await page.keyboard.type((await spoken(page))[3]);

  await expect(restartHint(page)).toBeVisible();
  await expect(page.getByText("Lo que se dictó")).toBeVisible();

  await page.goto("/historial");
  await expect(page.getByText("Dictado · 3 frases").first()).toBeVisible();
});

test("says so when there's no Spanish voice", async ({ page }) => {
  await page.addInitScript(fakeSpeech, [{ lang: "en-US", name: "English" }]);
  await startDictation(page);
  await expect(page.getByRole("alert")).toContainText("no tiene una voz en español");
});
