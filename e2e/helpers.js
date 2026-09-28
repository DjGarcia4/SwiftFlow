import { expect } from "@playwright/test";

// The text the test is waiting for, read off the characters on screen
export const referenceText = async (page) => {
  const chars = page.locator("[data-char-index]");
  await expect(chars.first()).toBeVisible();
  return (await chars.allTextContents()).join("");
};

// Opens the app and waits for the splash to get out of the way
export const openTest = async (page, path = "/") => {
  await page.goto(path);
  await expect(page.locator("[data-char-index]").first()).toBeVisible();
  await expect(page.locator(".z-\\[200\\]")).toHaveCount(0);
};

// Settings live in the toolbar on desktop, and in a sheet behind a button
// on a phone
export const isPhone = (page) => (page.viewportSize()?.width ?? 1280) < 640;

export const openSettings = async (page) => {
  if (isPhone(page)) {
    await page.getByRole("button", { name: "Configurar", exact: true }).click();
  }
};

export const closeSettings = async (page) => {
  if (isPhone(page)) {
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  }
};

// One option of a settings strip, like ("Modo", "Palabras"): radios, on
// the desktop bar and in the phone's settings sheet alike
export const option = (page, group, name) =>
  page
    .getByRole("radiogroup", { name: group })
    .locator("visible=true")
    .getByRole("radio", { name, exact: true });

// On desktop the mode is one button opening the menu of modes, which says
// the one that's on; on a phone the modes are laid out in the sheet
const modeButton = (page) => page.locator("[data-mode-button]").locator("visible=true");
const isModeMenu = (page, group) => group === "Modo" && !isPhone(page);

export const expectChosen = (page, group, name) =>
  isModeMenu(page, group)
    ? expect(modeButton(page)).toHaveAccessibleName(`Modo: ${name}. Cambiar de modo`)
    : expect(option(page, group, name)).toHaveAttribute("aria-checked", "true");

export const choose = async (page, group, name) => {
  if (isModeMenu(page, group)) await modeButton(page).click();
  await option(page, group, name).click();
  await expectChosen(page, group, name);
};

// The options that go with any mode (punctuation, "sin red", the demanding
// modes): behind the bar's "Opciones" on desktop, folded at the bottom of
// the sheet on a phone
export const openOptions = async (page) => {
  const button = isPhone(page)
    ? page.locator("[data-options-inline]").locator("visible=true")
    : page.locator("[data-options-button]");
  if ((await button.getAttribute("aria-expanded")) !== "true") await button.click();
};
export const closeOptions = async (page) => {
  if (!isPhone(page)) await page.keyboard.press("Escape");
};

export const punctuationToggle = (page) =>
  page
    .getByRole("button", { name: /Puntuación/ })
    .locator("visible=true")
    .first();

// A short words test: 10 words, no punctuation
export const setUpShortWordsTest = async (page) => {
  await openSettings(page);
  await choose(page, "Modo", "Palabras");
  await choose(page, "Cantidad", "10");
  await openOptions(page);
  const punctuation = punctuationToggle(page);
  if ((await punctuation.getAttribute("aria-pressed")) === "true") {
    await punctuation.click();
  }
  await closeOptions(page);
  await closeSettings(page);
};

// Types the whole text, as fast as a person never could
export const typeAll = async (page) => {
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  await page.keyboard.type(text);
  return text;
};

// The "press space to start over" hint under the results (not the same
// words read out by the screen reader announcer)
export const restartHint = (page) =>
  page.getByText("Presiona ESPACIO para empezar de nuevo");
