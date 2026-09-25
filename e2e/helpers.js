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

// One option of a settings strip, like ("Modo", "Palabras"). Desktop draws
// each strip as radios; the phone sheet as a group of toggle buttons.
export const option = (page, group, name) =>
  isPhone(page)
    ? page.getByRole("group", { name: group }).getByRole("button", { name, exact: true })
    : page
        .getByRole("radiogroup", { name: group })
        .locator("visible=true")
        .getByRole("radio", { name, exact: true });

export const expectChosen = (page, group, name) =>
  expect(option(page, group, name)).toHaveAttribute(
    isPhone(page) ? "aria-pressed" : "aria-checked",
    "true"
  );

export const choose = async (page, group, name) => {
  await option(page, group, name).click();
  await expectChosen(page, group, name);
};

// A short words test: 10 words, no punctuation
export const setUpShortWordsTest = async (page) => {
  await openSettings(page);
  await choose(page, "Modo", "Palabras");
  await choose(page, "Cantidad", "10");
  const punctuation = page
    .getByRole("button", { name: /Puntuación/ })
    .locator("visible=true")
    .first();
  if ((await punctuation.getAttribute("aria-pressed")) === "true") {
    await punctuation.click();
  }
  await closeSettings(page);
};

// Types the whole text, as fast as a person never could
export const typeAll = async (page) => {
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  await page.keyboard.type(text);
  return text;
};
